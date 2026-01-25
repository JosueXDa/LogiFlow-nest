import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('api/auth')
export class AuthController {
  /**
   * Proxy todos los endpoints de autenticación al auth-service
   * Better Auth expone sus endpoints en /api/auth/*
   */
  @All('*')
  async proxyAuth(@Req() req: Request, @Res() res: Response) {
    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    try {
      // Construir la URL completa con el path
      const targetUrl = `${authServiceUrl}${req.originalUrl}`;

      // Determinar el Origin - usar el del cliente o el del API Gateway
      const origin =
        req.headers.origin ||
        req.headers.referer ||
        `http://${req.headers.host}`;

      // Headers necesarios para Better Auth
      const headers: Record<string, string> = {
        'Content-Type': req.headers['content-type'] || 'application/json',
        Origin: origin, // Requerido por Better Auth para CSRF
        Host: new URL(authServiceUrl).host, // Host del auth service
      };

      // Incluir cookies si existen
      if (req.headers.cookie) {
        headers.Cookie = req.headers.cookie;
      }

      // Incluir user-agent si existe
      if (req.headers['user-agent']) {
        headers['User-Agent'] = req.headers['user-agent'];
      }

      // Forward la petición al auth service
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method)
          ? JSON.stringify(req.body)
          : undefined,
      });

      // Forward las cookies de respuesta
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        res.setHeader('Set-Cookie', setCookieHeader);
      }

      // Forward otros headers importantes
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      const data = await response.text();
      res.status(response.status).send(data);
    } catch (error) {
      console.error('Error proxying auth request console:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
