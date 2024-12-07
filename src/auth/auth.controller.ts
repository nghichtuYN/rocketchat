import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Users')
  @Post('users.register')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'successfully registered',
  })
  @UsePipes(new ValidationPipe())
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ApiTags('Authentication')
  @Post('users.login')
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Login failed' })
  @UsePipes(new ValidationPipe())
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.login(loginUserDto);
  }

  @ApiTags('Users')
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'OK' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @Post('users.regeneratePersonalAccessToken')
  refreshToken(@Body() { refresh_token }): Promise<any> {
    return this.authService.refreshToken(refresh_token);
  }
}
