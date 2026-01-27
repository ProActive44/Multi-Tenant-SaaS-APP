import app from './src/app.js';
import { config } from './src/config/env.js';
import logger from './src/utils/logger.js';
import prisma from './src/config/database.js';

const PORT = config.port;

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await testDatabaseConnection();

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${config.env}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔗 API base: http://localhost:${PORT}/api`);
  });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
