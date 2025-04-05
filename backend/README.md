# Travease Backend

This is the backend service for the Travease application, handling user authentication with phone OTP.

## Local Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the backend folder based on `.env.example`:
```
# Server Config
PORT=3000

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key_with_quotes"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

3. Run the backend server locally:
```
npm run dev
```

## Deployment to Render.com (Free Tier)

1. Create a Render.com account at [render.com](https://render.com)

2. Push your code to a GitHub repository

3. Connect your GitHub repository to Render:
   - In the Render dashboard, click "New" > "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (usually `main` or `master`)

4. Configure the deployment settings:
   - Name: `travease-backend` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free tier

5. Set up environment variables:
   - Add all variables from `.env.production`
   - **Important**: For `FIREBASE_PRIVATE_KEY`, make sure to include the quotes and newlines as is

6. Click "Create Web Service"

7. Wait for the deployment to complete. Your API will be available at the URL provided by Render.

8. Update your frontend to use the new API URL:
   - In your frontend code, update the `environment.ts` file:
     ```typescript
     export const environment = {
       production: true,
       apiUrl: 'https://your-render-url.onrender.com'
     };
     ```

## API Endpoints

### Authentication

- `POST /api/auth/send-otp`: Send OTP to phone number
  - Request body: `{ phoneNumber, countryCode }`

- `POST /api/auth/verify-otp`: Verify OTP
  - Request body: `{ phoneNumber, countryCode, otp }`

- `POST /api/auth/register`: Register user details
  - Request body: `{ uid, fullName, email, phoneNumber }`

- `POST /api/auth/skip-register`: Skip registration
  - Request body: `{ uid }`

### User Profile

- `GET /api/user/profile/:uid`: Get user profile

- `PUT /api/user/profile/:uid`: Update user profile
  - Request body: Profile fields to update

## External Services

### Twilio Setup

1. Create a Twilio account at [twilio.com](https://www.twilio.com)
2. Set up a Verify service in your Twilio console
3. Add your Account SID, Auth Token, and Verify Service SID to your environment variables

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication and Firestore in your Firebase console
3. Generate a private key from Project Settings -> Service Accounts
4. Add the Firebase configuration details to your environment variables 
