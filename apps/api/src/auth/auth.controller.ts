import { Controller, Post, Get, Body, Res, Req, HttpCode } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string; totpCode?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(body.email, body.password, body.totpCode);
    if ('refreshToken' in result && result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true, secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/auth/refresh',
      });
      const { refreshToken, ...rest } = result;
      return rest;
    }
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.['refresh_token'];
    if (!token) return { error: 'No refresh token' };
    const result = await this.auth.refresh(token);
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true, secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/auth/refresh',
    });
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = (req as any).user;
    await this.auth.logout(user?.jti);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const user = (req as any).user;
    return this.auth.me(user.sub);
  }

  @Post('mfa/setup')
  async setupMfa(@Req() req: Request) {
    const user = (req as any).user;
    return this.auth.setupMfa(user.sub);
  }

  @Post('mfa/verify')
  @HttpCode(200)
  async verifyMfa(@Req() req: Request, @Body() body: { code: string }) {
    const user = (req as any).user;
    return this.auth.verifyMfa(user.sub, body.code);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(200)
  async forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(200)
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.auth.resetPassword(body.token, body.password);
  }
}
