// src/config/database.config.ts
export default () => ({
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/db',
  },
});
