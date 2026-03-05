import app from './app';
import { config, validateConfig } from './config';
import logger from './middleware/logger';
import { runMigrations } from './db/migrations/001_create_grados';

const startServer = async (): Promise<void> => {
  try {
    // Validar configuración
    validateConfig();

    // Ejecutar migraciones antes de arrancar
    await runMigrations();

    // Iniciar servidor
    app.listen(config.port || 3000, () => {
      logger.info(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Bienvenido a la AsroPAU API!                 ║
║                                                   ║
║   📍 Local: http://localhost:${config.port}                 ║
║   🌐 API:   http://localhost:${config.port}${config.apiPrefix}          ║
║                                                   ║
║   Environment: ${config.env}                        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });


    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled Rejection:', err);
      process.exit(1);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
