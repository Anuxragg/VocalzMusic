const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../config/jwt');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setTokens = (res, accessToken, refreshToken) => {
  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
};

const getGoogleAuthReadiness = () => ({
  mongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI),
  jwtSecret: Boolean(process.env.JWT_SECRET),
  jwtRefreshSecret: Boolean(process.env.JWT_REFRESH_SECRET),
  googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
});

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ success: false, message: 'User already exists' });

    const user = await User.create({ username, email, password });
    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    return res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token missing' });

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    return res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: '' });
    }

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('accessToken', { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    return res.status(200).json({ success: true, message: 'Logged out' });
  } catch (error) {
    return next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'username avatar');
    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

exports.getSession = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;
    let userId = null;

    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        userId = decoded.id;
      } catch (err) {
        // Access token expired, fallback to refresh token below
      }
    }

    // If access token is missing or expired, check the 7-day refresh token
    if (!userId) {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const decodedRefresh = verifyRefreshToken(refreshToken);
      const user = await User.findById(decodedRefresh.id);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      // Automatically issue fresh tokens to seamlessly extend session
      const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user._id });
      user.refreshToken = newRefreshToken;
      await user.save();

      setTokens(res, newAccessToken, newRefreshToken);
      return res.status(200).json({ success: true, data: sanitizeUser(user) });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const readiness = getGoogleAuthReadiness();
    if (!readiness.mongoUri || !readiness.jwtSecret || !readiness.jwtRefreshSecret) {
      console.error('Google auth blocked by missing server configuration', readiness);
      return res.status(500).json({
        success: false,
        message: 'Server auth configuration is incomplete',
        code: 'AUTH_CONFIG_INCOMPLETE',
      });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    // Verify the access_token by fetching the user's profile from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return res.status(401).json({ success: false, message: 'Invalid Google access token' });
    }

    const userData = await response.json();
    const { sub: googleId, email, name, picture } = userData;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      let username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      user = await User.create({
        username,
        email,
        googleId,
        avatar: picture,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = refreshToken;
    await user.save();

    setTokens(res, accessToken, refreshToken);
    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('Google Auth Error:', {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });

    const isJwtConfigError =
      error.message?.includes('secretOrPrivateKey') ||
      error.message?.includes('jwt');

    if (isJwtConfigError) {
      return res.status(500).json({
        success: false,
        message: 'Server token configuration is invalid',
        code: 'AUTH_TOKEN_CONFIG_INVALID',
      });
    }

    const isMongoError =
      error.name === 'MongoServerError' ||
      error.name === 'MongooseError' ||
      error.name === 'MongoNetworkError' ||
      error.message?.toLowerCase().includes('mongo');

    if (isMongoError) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed during Google login',
        code: 'AUTH_DB_FAILURE',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Google authentication failed on the server',
      code: 'GOOGLE_AUTH_SERVER_ERROR',
    });
  }
};
