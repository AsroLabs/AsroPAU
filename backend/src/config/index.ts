import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

interface Config {
    env: string;
    port: number;
    apiPrefix: string;
    corsOrigin: string;
    logLevel: string;
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
};

export const validateConfig = (): void => {
    // PORT has a default value (3000) so it is not required
    const requireVars: string[] = [];
    const missing = requireVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

if (config.env === 'development') {
    console.log('Configuración:');
  console.log(`   - Environment: ${config.env}`);
  console.log(`   - Port: ${config.port}`);
  console.log(`   - API Prefix: ${config.apiPrefix}`);
  console.log(`   - CORS Origin: ${config.corsOrigin}`);
  console.log(`   - Log Level: ${config.logLevel}`);

}