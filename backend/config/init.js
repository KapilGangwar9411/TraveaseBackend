/**
 * Initialization script for backend services
 * This ensures all services are properly set up before the server starts
 */

const twilioService = require('../services/twilio.service');
const firebaseService = require('../services/firebase.service');

/**
 * Initialize all required services
 * @returns {Promise<boolean>} Whether initialization was successful
 */
const initializeServices = async () => {
  console.log('Initializing backend services...');

  try {
    // Initialize Twilio
    const twilioInitialized = twilioService.initTwilio();
    if (!twilioInitialized) {
      console.warn('⚠️ Twilio service failed to initialize. OTP functionality may not work.');
    } else {
      console.log('✅ Twilio services initialized successfully');
    }

    // Initialize Firebase
    const firebaseInitialized = firebaseService.initFirebase();
    if (!firebaseInitialized) {
      console.warn('⚠️ Firebase service failed to initialize. Authentication functionality may not work.');
    } else {
      console.log('✅ Firebase services initialized successfully');
    }

    return twilioInitialized && firebaseInitialized;
  } catch (error) {
    console.error('Error initializing services:', error);
    return false;
  }
};

module.exports = initializeServices;