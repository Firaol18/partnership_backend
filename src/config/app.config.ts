// src/config/app.config.ts
export default () => ({
  app: {
    name: process.env.APP_NAME || 'NestJS App',
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:3000',
    apiPrefix: process.env.API_PREFIX || 'api',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    credentials: true,
  },
  rateLimit: {
    ttl: 60,
    limit: 100,
  },
});
