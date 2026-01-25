import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'auth_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentado a 10 segundos
  // Agregar configuración de query timeout
  query_timeout: 10000,
});

// Manejar errores de conexión del pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Instancia de Better Auth
export const auth = betterAuth({
  database: pool as any,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // 1 día
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  advanced: {
    // En desarrollo, deshabilitar la verificación CSRF estricta
    disableCSRFCheck: process.env.NODE_ENV === 'development',
  },
  baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
});
