require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const songsRoutes = require('./routes/songs');
const albumsRoutes = require('./routes/albums');
const artistsRoutes = require('./routes/artists');
const playlistsRoutes = require('./routes/playlists');
const usersRoutes = require('./routes/users');
const playsRoutes = require('./routes/plays');
const searchRoutes = require('./routes/search');

const app = express();
app.set('trust proxy', 1);
const hasRequiredAuthEnv = () => ({
  mongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI),
  jwtSecret: Boolean(process.env.JWT_SECRET),
  jwtRefreshSecret: Boolean(process.env.JWT_REFRESH_SECRET),
  googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
});

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!MONGO_URI) {
    console.warn('⚠️ No MONGO_URI found in environment variables');
    return;
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => {
      console.log('✅ MongoDB Connected (Serverless)');
      return mongoose;
    }).catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Ensure database connection is established before handling any API request
app.use(async (req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }

  if (req.path.startsWith('/api')) {
    try {
      await connectToDatabase();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }
  }
  next();
});

// CORS setup for the frontend origins configured for this deployment
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean).map((origin) => origin.trim().replace(/\/$/, ''));

const isLocalDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  if (typeof origin !== 'string') return false;
  return allowedOrigins.includes(origin.replace(/\/$/, '')) || isLocalDevelopmentOrigin(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
}));

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const origin = req.get('Origin');
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed' });
  }

  return next();
});

app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/songs', (req, res, next) => {
  if (req.method === 'POST') {
    console.log(`🚀 [BACKEND] Incoming song upload request: ${req.headers['content-length']} bytes`);
  }
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 100 }));
app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => {
  const env = hasRequiredAuthEnv();
  res.status(200).json({
    success: true,
    message: 'VOCALZ API healthy',
    environment: process.env.NODE_ENV,
    authConfig: {
      ready: Object.values(env).every(Boolean),
      ...env,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/plays', playsRoutes);
app.use('/api/search', searchRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') status = 400;
  if (err.code === 11000) status = 409;
  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;

  console.error('API request failed', {
    method: req.method,
    path: req.path,
    status,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  const messages = {
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    413: 'Request body too large',
    422: 'Invalid input',
    429: 'Too many requests',
  };
  res.status(status).json({
    success: false,
    message: messages[status] || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

// Only start the listener if run directly (local development)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`VOCALZ server running on port ${PORT}`);
  });
  
  // High timeouts for large music file processing (10 mins)
  server.timeout = 600000;
  server.keepAliveTimeout = 610000;
  server.headersTimeout = 620000;
}

module.exports = app;
