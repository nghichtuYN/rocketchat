import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    console.log(JSON.stringify(registerUserDto));
    return this.authService.register(registerUserDto);
  }
}
