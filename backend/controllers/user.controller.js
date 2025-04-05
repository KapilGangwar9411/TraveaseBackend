const firebaseService = require('../services/firebase.service');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user profile from Firebase
    const userRecord = await firebaseService.getUserById(uid);

    // If user not found, return appropriate error
    if (!userRecord) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user: userRecord }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message || 'Unknown error occurred'
    });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const profileData = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Sanitize and validate profile data to prevent unnecessary updates
    const sanitizedData = {};

    // Only include valid fields that have values
    const allowedFields = [
      'displayName', 'email', 'phoneNumber', 'photoURL',
      'companyName', 'corporateEmail', 'shortBio', 'hobbies',
      'vehicleType', 'vehicleName', 'vehicleRegNumber',
      'facilities', 'instructions'
    ];

    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        sanitizedData[field] = profileData[field];
      }
    });

    // Add updatedAt timestamp
    sanitizedData.updatedAt = new Date().toISOString();

    // Update user profile in Firebase
    const updatedUser = await firebaseService.updateUserProfile(uid, sanitizedData);

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message || 'Unknown error occurred'
    });
  }
};
