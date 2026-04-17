const axios = require('axios');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const refreshGoogleAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required to refresh Google access token');
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for token refresh');
  }

  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const response = await axios.post(TOKEN_URL, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return {
    accessToken: response.data.access_token,
    expiresIn: Number(response.data.expires_in) || 3600,
    refreshToken: response.data.refresh_token || null
  };
};

module.exports = {
  refreshGoogleAccessToken
};
