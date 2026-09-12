import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.service.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: any) {
    return this.service.refresh(body);
  }

  @Post('logout')
  logout(@Body() body: any) {
    return this.service.logout(body);
  }

  @Post('mfa/setup')
  setupMfa(@Body() body: any) {
    return this.service.setupMfa(body);
  }

  @Post('mfa/verify')
  verifyMfa(@Body() body: any) {
    return this.service.verifyMfa(body);
  }
}
