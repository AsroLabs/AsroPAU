import app from './app';
import { config, validateConfig } from './config';
import logger from './middleware/logger';

const startServer = (): void => {
  try {
    // Validar configuración
    validateConfig();

    // Iniciar servidor
    app.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Selectividad API is running!                ║
║                                                   ║
║   📍 Local: http://localhost:${config.port}                  ║
║   🌐 API:   http://localhost:${config.port}${config.apiPrefix}       ║
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