import { Controller, Get, Headers, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { auth } from './auth';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/auth/get-session')
  async getSession(@Req() request: Request) {
    try {
      // Better Auth lee las cookies automáticamente del request
      const session = await auth.api.getSession({
        headers: request.headers as any,
      });

      console.log('Session retrieved:', session);
      
      return session || { user: null };
    } catch (error) {
      console.error('Session validation error:', error);
      return { user: null };
    }
  }
}
