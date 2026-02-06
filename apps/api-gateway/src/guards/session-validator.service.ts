import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SessionValidatorService implements OnModuleInit {
  private pool: Pool;

  onModuleInit() {
    // Conectar a la base de datos de auth
    this.pool = new Pool({
      host: process.env.AUTH_DB_HOST || 'localhost',
      port: Number(process.env.AUTH_DB_PORT || 5432),
      user: process.env.AUTH_DB_USER || 'postgres',
      password: process.env.AUTH_DB_PASSWORD || 'postgres',
      database: process.env.AUTH_DB_NAME || 'auth_db',
      max: 10,
    });
  }

  async validateSession(token: string): Promise<{ user: any } | null> {
    try {
      // Extraer solo el ID del token (antes del punto si tiene firma)
      const tokenId = token.split('.')[0];

      const result = await this.pool.query(
        `SELECT 
          s.id as session_id,
          s."expiresAt",
          u.id,
          u.name,
          u.email,
          u.role,
          u.image,
          u."emailVerified",
          u."createdAt",
          u."updatedAt"
        FROM session s
        INNER JOIN "user" u ON s."userId" = u.id
        WHERE s.token = $1 AND s."expiresAt" > NOW()`,
        [tokenId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return {
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          image: row.image,
          emailVerified: row.emailVerified,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }
}
