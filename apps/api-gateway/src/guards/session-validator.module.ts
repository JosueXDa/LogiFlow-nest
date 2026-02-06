import { Module, Global } from '@nestjs/common';
import { SessionValidatorService } from './session-validator.service';

@Global()
@Module({
  providers: [SessionValidatorService],
  exports: [SessionValidatorService],
})
export class SessionValidatorModule {}
