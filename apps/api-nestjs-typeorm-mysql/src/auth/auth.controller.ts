import { Body, Controller, Delete, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import type { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(200)
  logout() {
    // JWT is stateless — invalidation handled client-side by discarding the token
    return { message: 'logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: { user: { id: string } }) {
    return this.authService.me(req.user.id);
  }

  @Delete('me')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteMe(@Request() req: { user: { id: string } }) {
    return this.authService.deleteUser(req.user.id);
  }
}
