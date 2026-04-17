const crypto = require('crypto');

const OAUTH_STATE_COOKIE = 'yt_oauth_state';
const OAUTH_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_SKEW_MS = 60 * 1000;

const isProduction = () => process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'none' : 'lax',
  maxAge: OAUTH_COOKIE_MAX_AGE_MS,
  path: '/'
});

const getEncryptionKey = () => {
  const secret = process.env.OAUTH_COOKIE_ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('OAUTH_COOKIE_ENCRYPTION_KEY (or JWT_SECRET fallback) is required');
  }

  return crypto.createHash('sha256').update(secret).digest();
};

const encryptState = (state) => {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const plaintext = Buffer.from(JSON.stringify(state), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
};

const decryptState = (encodedState) => {
  const [ivEncoded, tagEncoded, dataEncoded] = String(encodedState).split('.');

  if (!ivEncoded || !tagEncoded || !dataEncoded) {
    return null;
  }

  const iv = Buffer.from(ivEncoded, 'base64url');
  const authTag = Buffer.from(tagEncoded, 'base64url');
  const encrypted = Buffer.from(dataEncoded, 'base64url');

  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
};

const normalizeOAuthState = (state) => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  return {
    userId: typeof state.userId === 'string' ? state.userId : null,
    accessToken: typeof state.accessToken === 'string' ? state.accessToken : null,
    accessTokenExpiresAt: Number.isFinite(state.accessTokenExpiresAt) ? state.accessTokenExpiresAt : 0,
    refreshToken: typeof state.refreshToken === 'string' ? state.refreshToken : null
  };
};

const readOAuthStateCookie = (req) => {
  const cookieValue = req.cookies?.[OAUTH_STATE_COOKIE];

  if (!cookieValue) {
    return null;
  }

  try {
    return normalizeOAuthState(decryptState(cookieValue));
  } catch (error) {
    console.error('Failed to decode OAuth cookie:', error.message);
    return null;
  }
};

const setOAuthStateCookie = (res, state) => {
  const normalized = normalizeOAuthState(state);

  if (!normalized?.userId || !normalized?.refreshToken) {
    throw new Error('Cannot persist OAuth cookie without userId and refreshToken');
  }

  const encrypted = encryptState(normalized);
  res.cookie(OAUTH_STATE_COOKIE, encrypted, getCookieOptions());
};

const clearOAuthStateCookie = (res) => {
  const { maxAge, ...clearOptions } = getCookieOptions();
  res.clearCookie(OAUTH_STATE_COOKIE, clearOptions);
};

const hasFreshAccessToken = (state) => {
  return Boolean(
    state?.accessToken &&
    Number.isFinite(state?.accessTokenExpiresAt) &&
    state.accessTokenExpiresAt > Date.now() + ACCESS_TOKEN_SKEW_MS
  );
};

module.exports = {
  readOAuthStateCookie,
  setOAuthStateCookie,
  clearOAuthStateCookie,
  hasFreshAccessToken
};
