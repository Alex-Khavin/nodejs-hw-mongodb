import { OAuth2Client } from 'google-auth-library';
import { getEnvVar } from './getEnvVar.js';

const googleOAuth2Client = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: getEnvVar('GOOGLE_AUTH_REDIRECT_URIS'),
});

export const getGoogleOAuthUrl = async () => {
  return googleOAuth2Client.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
};

export const validateCode = async (code) => {
    const response = await googleOAuth2Client.getToken(code);

    return googleOAuth2Client.verifyIdToken({
        idToken: response.tokens.id_token
    });
 };
