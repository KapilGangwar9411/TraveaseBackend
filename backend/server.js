const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
console.log(`Loading environment from ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Import initialization script
const initializeServices = require('./config/init');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-frontend-url.com']
    : 'http://localhost:8100',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Simple route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Travease API',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    services: {
      twilio: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured',
      firebase: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not configured'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? null : err.message
  });
});

// Start server after initializing services
const startServer = async () => {
  try {
    // Initialize services
    const servicesInitialized = await initializeServices();
    if (!servicesInitialized) {
      console.warn('⚠️ Some services failed to initialize. Application may not function correctly.');
    }

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`
====================================
🚀 Server is running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
====================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
