const twilioService = require('../services/twilio.service');
const firebaseService = require('../services/firebase.service');

/**
 * Send OTP to the provided phone number
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber, countryCode } = req.body;

    if (!phoneNumber || !countryCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and country code are required'
      });
    }

    const formattedNumber = `+${countryCode}${phoneNumber}`;

    // Send OTP via Twilio
    const otpResult = await twilioService.sendOTP(formattedNumber);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        sid: otpResult.sid,
        phoneNumber: phoneNumber,
        countryCode: countryCode
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message || 'Unknown error occurred'
    });
  }
};

/**
 * Verify OTP entered by user
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, countryCode, otp } = req.body;

    if (!phoneNumber || !countryCode || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, country code, and OTP are required'
      });
    }

    const formattedNumber = `+${countryCode}${phoneNumber}`;

    // Verify OTP via Twilio
    const verificationResult = await twilioService.verifyOTP(formattedNumber, otp);

    if (verificationResult.status === 'approved') {
      // Check if user exists in Firebase
      let userRecord = await firebaseService.getUserByPhone(formattedNumber);
      let isNewUser = false;

      // If user doesn't exist, create a basic profile
      if (!userRecord) {
        userRecord = await firebaseService.createUserWithPhone(formattedNumber);
        isNewUser = true;
      }

      // Create a custom token for the user
      const token = await firebaseService.createCustomToken(userRecord.uid);

      // Determine if user needs to complete registration
      const needsRegistration = isNewUser ||
        !userRecord.displayName ||
        (userRecord.profile && !userRecord.profile.profileCompleted);

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          token,
          user: {
            uid: userRecord.uid,
            phoneNumber: formattedNumber,
            displayName: userRecord.displayName || '',
            email: userRecord.email || '',
            photoURL: userRecord.photoURL || '',
            profile: userRecord.profile || {}
          },
          isNewUser: needsRegistration
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        status: verificationResult.status
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message || 'Unknown error occurred'
    });
  }
};

/**
 * Register user with additional details
 */
exports.registerUser = async (req, res) => {
  try {
    const { uid, fullName, email, phoneNumber, countryCode } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Optional fields validation
    const updateData = {};
    if (fullName) updateData.displayName = fullName;
    if (email) updateData.email = email;

    // Only update phone number if both phone and country code are provided
    // and ensure it's properly formatted in E.164 format
    if (phoneNumber && countryCode) {
      // Format to E.164 format with + sign and country code
      updateData.phoneNumber = `+${countryCode}${phoneNumber.replace(/[^0-9]/g, '')}`;
    } else if (phoneNumber && !countryCode) {
      // If phoneNumber is provided but not countryCode, check if it's already in E.164 format
      if (phoneNumber.startsWith('+')) {
        updateData.phoneNumber = phoneNumber;
      } else {
        // Don't update phone without proper country code
        console.warn('Phone number provided without country code, skipping phone update');
      }
    }

    // Additional profile data that can be stored in Firestore
    const profileData = {
      ...updateData,
      // Add any other fields you want to store
      updatedAt: new Date().toISOString()
    };

    console.log('Updating user profile with data:', JSON.stringify(profileData));

    // Update user profile in Firebase
    const updatedUser = await firebaseService.updateUserProfile(uid, profileData);

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        user: {
          uid: updatedUser.uid,
          phoneNumber: updatedUser.phoneNumber || '',
          displayName: updatedUser.displayName || fullName,
          email: updatedUser.email || email,
          photoURL: updatedUser.photoURL || '',
          profile: updatedUser.profile || {}
        }
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message || 'Unknown error occurred'
    });
  }
};

/**
 * Skip registration and redirect to home
 */
exports.skipRegister = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get current user from Firebase
    const userRecord = await firebaseService.getUserById(uid);

    // Mark profile as completed in Firestore only (not Auth)
    // We're avoiding Auth updates here to prevent phone number validation issues
    await firebaseService.updateFirestoreOnly(uid, {
      profileCompleted: true,
      skipRegistration: true,
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Registration skipped',
      data: {
        user: {
          uid: userRecord.uid,
          phoneNumber: userRecord.phoneNumber || '',
          displayName: userRecord.displayName || '',
          email: userRecord.email || '',
          photoURL: userRecord.photoURL || '',
          profile: userRecord.profile || {}
        }
      }
    });
  } catch (error) {
    console.error('Error skipping registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to skip registration',
      error: error.message || 'Unknown error occurred'
    });
  }
};
