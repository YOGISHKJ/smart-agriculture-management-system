import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://yogish_k_j:Yogish%40123@localhost:5432/agripulse_db',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agripulse_db',
  jwtSecret: process.env.JWT_SECRET || 'agripulse_jwt_dev_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

