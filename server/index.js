require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const songsRoutes = require('./routes/songs');
const albumsRoutes = require('./routes/albums');
const artistsRoutes = require('./routes/artists');
const playlistsRoutes = require('./routes/playlists');
const usersRoutes = require('./routes/users');
const playsRoutes = require('./routes/plays');
const searchRoutes = require('./routes/search');

const app = express();
const hasRequiredAuthEnv = () => ({
  mongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI),
  jwtSecret: Boolean(process.env.JWT_SECRET),
  jwtRefreshSecret: Boolean(process.env.JWT_REFRESH_SECRET),
  googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
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
  if (req.path.startsWith('/api')) {
    try {
      await connectToDatabase();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }
  }
  next();
});

// CORS setup with fallback for production origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin (no origin header), local development, or explicitly allowed production origins
    if (!origin || origin.startsWith('http://localhost') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production same-domain situations, the origin might be the Vercel URL
      // We allow it to be dynamic to solve browser blocking
      callback(null, true); 
    }
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/songs', (req, res, next) => {
  if (req.method === 'POST') {
    console.log(`🚀 [BACKEND] Incoming song upload request: ${req.headers['content-length']} bytes`);
  }
  next();
});

// Set global JSON limits higher for consistency
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api', limiter);

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
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
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
