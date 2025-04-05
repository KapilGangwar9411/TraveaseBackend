const admin = require('firebase-admin');

// Variables for Firebase services
let firestore;
let auth;

/**
 * Initialize Firebase Admin SDK
 * This should be called once when the server starts
 */
exports.initFirebase = () => {
  try {
    // Check if required environment variables are set
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase credentials. Please check your .env file');
      return false;
    }

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      }),
      databaseURL
    });

    // Initialize services
    firestore = admin.firestore();
    auth = admin.auth();

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

/**
 * Get user by phone number
 * @param {string} phoneNumber - The formatted phone number
 * @returns {Object|null} - User record or null if not found
 */
exports.getUserByPhone = async (phoneNumber) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized. Call initFirebase() first');
    }

    // Query Firestore first to find user by phone number
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.where('phoneNumber', '==', phoneNumber).limit(1).get();

    if (!snapshot.empty) {
      // User found in Firestore, get the auth record
      const userData = snapshot.docs[0].data();
      const userId = snapshot.docs[0].id;

      try {
        const userRecord = await auth.getUser(userId);
        return userRecord;
      } catch (authError) {
        console.warn(`User exists in Firestore but not in Auth. ID: ${userId}`, authError);
        return null;
      }
    }

    // Fallback to legacy method if user not found in Firestore
    try {
      const userRecords = await auth.getUsers([
        { phoneNumber }
      ]);

      if (userRecords.users.length > 0) {
        return userRecords.users[0];
      }
    } catch (authListError) {
      console.error('Error in legacy phone lookup:', authListError);
    }

    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
};

/**
 * Get user by UID
 * @param {string} uid - The user ID
 * @returns {Object} - User record with Firestore data
 */
exports.getUserById = async (uid) => {
  try {
    if (!auth || !firestore) {
      throw new Error('Firebase not initialized. Call initFirebase() first');
    }

    // Get auth user record
    const userRecord = await auth.getUser(uid);

    // Get additional user data from Firestore
    const userDoc = await firestore.collection('users').doc(uid).get();

    if (userDoc.exists) {
      // Combine auth user with Firestore data
      return {
        ...userRecord,
        profile: userDoc.data()
      };
    }

    return userRecord;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

/**
 * Create a new user with phone number
 * @param {string} phoneNumber - The formatted phone number
 * @returns {Object} - Created user record
 */
exports.createUserWithPhone = async (phoneNumber) => {
  try {
    if (!auth || !firestore) {
      throw new Error('Firebase not initialized. Call initFirebase() first');
    }

    // Create user in Auth
    const userRecord = await auth.createUser({
      phoneNumber: phoneNumber
    });

    // Create rich user profile in Firestore
    await firestore.collection('users').doc(userRecord.uid).set({
      phoneNumber: phoneNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      profileCompleted: false
    });

    console.log(`New user created with ID: ${userRecord.uid} and phone: ${phoneNumber}`);

    // Return combined user record
    return {
      ...userRecord,
      profile: {
        phoneNumber,
        profileCompleted: false
      }
    };
  } catch (error) {
    console.error('Error creating user with phone:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} uid - The user ID
 * @param {Object} profile - The profile data to update
 * @returns {Object} - Updated user record
 */
exports.updateUserProfile = async (uid, profile) => {
  try {
    if (!auth || !firestore) {
      throw new Error('Firebase not initialized. Call initFirebase() first');
    }

    // Prepare Auth update data
    const authUpdate = {};
    if (profile.displayName) authUpdate.displayName = profile.displayName;
    if (profile.email) authUpdate.email = profile.email;
    if (profile.phoneNumber) authUpdate.phoneNumber = profile.phoneNumber;

    // Update Auth user
    const userRecord = await auth.updateUser(uid, authUpdate);

    // Prepare Firestore update data
    const firestoreUpdate = {
      ...profile,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      profileCompleted: true
    };

    // Update Firestore user data
    await firestore.collection('users').doc(uid).update(firestoreUpdate);

    console.log(`User profile updated for ID: ${uid}`);

    // Get the updated user record with Firestore data
    return await exports.getUserById(uid);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Create a custom token for the user
 * @param {string} uid - The user ID
 * @returns {string} - Custom token
 */
exports.createCustomToken = async (uid) => {
  try {
    if (!auth) {
      throw new Error('Firebase not initialized. Call initFirebase() first');
    }

    // Update last login time in Firestore
    await firestore.collection('users').doc(uid).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create custom token
    const customToken = await auth.createCustomToken(uid);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
};

/**
 * Update user data in Firestore only (no Auth update)
 * @param {string} uid - The user ID
 * @param {Object} data - The data to update in Firestore
 * @returns {boolean} - Success status
 */
exports.updateFirestoreOnly = async (uid, data) => {
  try {
    if (!firestore) {
      throw new Error('Firebase not initialized. Call initFirebase() first');
    }

    // Check if user exists in Firestore
    const userDoc = await firestore.collection('users').doc(uid).get();

    if (userDoc.exists) {
      // Update existing document
      await firestore.collection('users').doc(uid).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new document if it doesn't exist
      await firestore.collection('users').doc(uid).set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log(`User Firestore data updated for ID: ${uid}`);
    return true;
  } catch (error) {
    console.error('Error updating Firestore user data:', error);
    throw error;
  }
};
