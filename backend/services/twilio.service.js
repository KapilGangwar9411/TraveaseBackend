const twilio = require('twilio');

// Initialize Twilio client
let client;
let verifyServiceSid;

/**
 * Initialize Twilio client connection
 * This should be called once when the server starts
 */
exports.initTwilio = () => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      console.error('Missing Twilio credentials. Please check your .env file');
      return false;
    }

    client = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
    return false;
  }
};

/**
 * Send OTP to the provided phone number
 * @param {string} phoneNumber - The formatted phone number with country code
 * @returns {Promise} - The Twilio verification response
 */
exports.sendOTP = async (phoneNumber) => {
  try {
    if (!client) {
      throw new Error('Twilio client not initialized. Call initTwilio() first');
    }

    // Remove any spaces or special characters from phone number
    const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

    console.log(`Sending OTP to ${cleanPhoneNumber}`);

    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({ to: cleanPhoneNumber, channel: 'sms' });

    console.log(`OTP sent to ${cleanPhoneNumber}, status: ${verification.status}`);
    return verification;
  } catch (error) {
    console.error('Twilio sendOTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP entered by the user
 * @param {string} phoneNumber - The formatted phone number with country code
 * @param {string} code - The OTP code entered by the user
 * @returns {Promise} - The Twilio verification check response
 */
exports.verifyOTP = async (phoneNumber, code) => {
  try {
    if (!client) {
      throw new Error('Twilio client not initialized. Call initTwilio() first');
    }

    // Remove any spaces or special characters from phone number
    const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

    console.log(`Verifying OTP for ${cleanPhoneNumber}`);

    const verificationCheck = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({ to: cleanPhoneNumber, code });

    console.log(`OTP verification for ${cleanPhoneNumber}: ${verificationCheck.status}`);
    return verificationCheck;
  } catch (error) {
    console.error('Twilio verifyOTP error:', error);
    throw error;
  }
};
