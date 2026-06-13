const jwtSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'access_secret';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'refresh_secret';

export const env = {
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/hrms-pro',
    accessTokenSecret: jwtSecret,
    refreshTokenSecret: refreshSecret,
    corsOrigin: process.env.CORS_ORIGIN,
    isProduction: process.env.NODE_ENV === 'production',
};

export const cookieOptions = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
};
