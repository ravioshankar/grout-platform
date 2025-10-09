# OAuth Setup Guide

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:8000/api/v1/auth/callback/google` (development)
   - `https://yourdomain.com/api/v1/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add "Facebook Login" product
4. Configure OAuth redirect URIs in Settings → Basic:
   - `http://localhost:8000/api/v1/auth/callback/facebook` (development)
   - `https://yourdomain.com/api/v1/auth/callback/facebook` (production)
5. Copy App ID and App Secret to `.env`:
   ```
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   ```

## Testing OAuth Flow

### Google Login
1. Navigate to: `http://localhost:8000/api/v1/auth/login/google`
2. Authorize with Google account
3. Receive JWT token in response

### Facebook Login
1. Navigate to: `http://localhost:8000/api/v1/auth/login/facebook`
2. Authorize with Facebook account
3. Receive JWT token in response

## API Endpoints

- `POST /api/v1/auth/signup` - Create new user account (returns JWT token)
- `POST /api/v1/auth/login` - Login with email/password (returns JWT token)
- `GET /api/v1/auth/login/google` - Initiate Google OAuth
- `GET /api/v1/auth/login/facebook` - Initiate Facebook OAuth
- `GET /api/v1/auth/callback/{provider}` - OAuth callback (automatic)
- `GET /api/v1/auth/me` - Get current authenticated user

## User Flow

1. **OAuth Users**: No password required, authenticated via provider
2. **Email Users**: Password required for signup and login
3. **Linked Accounts**: OAuth can be linked to existing email accounts

## Security Notes

- OAuth tokens are validated server-side
- User email must be provided by OAuth provider
- JWT tokens expire after 30 minutes
- HTTPS required in production
