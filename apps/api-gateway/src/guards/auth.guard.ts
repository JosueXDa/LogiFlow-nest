import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

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
      // IMPORTANTE: Pasamos las cookies exactamente como las recibimos del navegador
      const response = await fetch(`${authServiceUrl}/api/auth/get-session`, {
        method: 'GET',
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json',
          // Better Auth necesita el header Origin para validar trusted origins
          Origin: 'http://localhost:3009',
          // También podemos agregar el host del gateway
          'X-Forwarded-Host': 'localhost:3009',
          'X-Forwarded-Proto': 'http',
        },
        credentials: 'include', // Asegura que las cookies se envíen
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth service error:', response.status, errorText);
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      const sessionData = await response.json();

      // Verificar que hay un usuario en la sesión
      if (!sessionData?.user) {
        throw new UnauthorizedException('No hay usuario autenticado');
      }

      // Añadir los datos del usuario a la request para uso posterior
      (request as any).user = sessionData.user;

      if (!requiredRoles) {
        return true;
      }

      const userRole = sessionData.user.role;
      return requiredRoles.includes(userRole);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Error en AuthGuard:', error);
      throw new UnauthorizedException('Error al verificar la autenticación');
    }
  }
}
