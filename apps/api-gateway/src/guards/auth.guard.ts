import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Request } from 'express';
import { SessionValidatorService } from './session-validator.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionValidator: SessionValidatorService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Excluir rutas de autenticación del guard para evitar recursión
    if (request.path.startsWith('/api/auth')) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    try {
      // Intentar obtener el token desde el header Authorization (Bearer token)
      const authHeader = request.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // Si no hay Bearer token, intentar obtenerlo desde las cookies
      if (!token) {
        const cookies = request.headers.cookie;
        if (!cookies) {
          throw new UnauthorizedException('No hay sesión activa');
        }
        
        // Extraer el token de better_auth.session_token
        const cookieMatch = cookies.match(/better_auth\.session_token=([^;]+)/);
        token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : undefined;
        
        if (!token) {
          throw new UnauthorizedException('No hay sesión activa');
        }
      }

      // Validar sesión directamente contra la base de datos
      const sessionData = await this.sessionValidator.validateSession(token);
      console.log('Session data received:', JSON.stringify(sessionData));

      // Verificar que hay un usuario en la sesión
      if (!sessionData?.user) {
        console.log('No user in session data');
        throw new UnauthorizedException('No hay usuario autenticado');
      }
      
      console.log('User authenticated:', sessionData.user.email, 'Role:', sessionData.user.role);

      // Añadir los datos del usuario a la request para uso posterior
      (request as any).user = sessionData.user;

      if (!requiredRoles) {
        return true;
      }

      const userRole = sessionData.user.role;
      
      // ADMIN siempre tiene acceso a todo
      if (userRole === 'ADMIN') {
        return true;
      }
      
      return requiredRoles.includes(userRole);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al verificar la autenticación');
    }
  }
}
