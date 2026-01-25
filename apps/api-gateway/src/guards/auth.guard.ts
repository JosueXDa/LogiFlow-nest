import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    try {
      // Obtener el token de la sesión desde las cookies
      const cookies = request.headers.cookie;
      if (!cookies) {
        throw new UnauthorizedException('No hay sesión activa');
      }

      // Verificar la sesión con el servicio de auth mediante HTTP
      const response = await fetch(`${authServiceUrl}/api/auth/get-session`, {
        method: 'GET',
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json',
          Origin: request.headers.origin || `http://${request.headers.host}`,
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      const sessionData = await response.json();

      // Verificar que hay un usuario en la sesión
      if (!sessionData?.user) {
        throw new UnauthorizedException('No hay usuario autenticado');
      }

      // Añadir los datos del usuario a la request para uso posterior
      (request as any).user = sessionData.user;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al verificar la autenticación');
    }
  }
}
