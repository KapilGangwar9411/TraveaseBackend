# Travease - Your Travel Companion App

## Overview
Travease is a comprehensive travel application designed to help users plan, organize, and enjoy their trips seamlessly. The application integrates various services including authentication, trip planning, and social features.

## Project Structure
- **Frontend**: Angular-based web application
- **Backend**: Node.js/Express API server

## Local Development

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server: `npm run dev`

### Frontend Setup
1. Install dependencies: `npm install`
2. Start the development server: `npm start`
3. Access the application at `http://localhost:4200`

## Deployment

### Backend Deployment
See `backend/README.md` for detailed backend deployment instructions.

### Frontend Deployment (Vercel)

1. **Prepare your project for production**:
   ```bash
   npm run build:prod
   ```

2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

6. **Environment Variables**:
   - Make sure to set the environment variables on Vercel dashboard
   - Required variables: `FRONTEND_URL`

## Key Features
- User authentication with OTP verification
- User profile management
- Trip planning and itinerary creation
- Interactive maps and location services

## Technologies Used
- **Frontend**: Angular, Ionic, TypeScript
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT, Twilio (SMS verification)
- **Storage**: Firebase Storage
- **Database**: Firebase Firestore
- **Deployment**: Render (Backend), Vercel (Frontend)

## Contributing
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

### Project Requirements
    node: v18.19.1
    npm: v8.1.3
    ionic: v8.0.0
    cordova: 10.1.2
    jdk: 11.0.2
### Build Apk
    Debug: `ionic cordova run android --prod` OR `ionic cordova build android --prod`
    Release: `ionic cordova build android --prod --release --buildConfig=build.json` OR `ionic cordova build android --prod --release --buildConfig=build.json -- -- --packageType=bundle`
    