import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, LoginResponseDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() payload: LoginDto): Promise<LoginResponseDto> {
    return this.authService.handleLogin(payload);
  }
}
