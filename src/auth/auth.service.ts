import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/users.schema';
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash.toString();
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password } = registerUserDto;
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }
    const hashedPassword = await this.hashPassword(password);

    const newUser = new this.userModel({
      ...registerUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  private async generateToken(payload: {
    _id: string;
    email: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECRET'),
      expiresIn: '1d',
    });
    return { access_token, refresh_token };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const existingUser = await this.userModel
      .findOne({ email: loginUserDto.email })
      .exec();
    if (!existingUser) {
      throw new HttpException(
        'Tài khoản không tồn tại ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const checkPass = bcrypt.compareSync(
      loginUserDto.password,
      existingUser.password,
    );

    if (!checkPass) {
      throw new HttpException(
        'Mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = {
      _id: existingUser._id.toString(),
      email: existingUser.email,
    };
    return this.generateToken(payload);
  }

  async refreshToken(refresh_token: string): Promise<any> {
    console.log('Received refresh token type:', typeof refresh_token); // Log the token type to confirm it's a string
    try {
      const decoded = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('SECRET'),
      });
      const checkExistUser = await this.userModel
        .findOne({ _id: decoded?._id })
        .exec();
      if (checkExistUser) {
        return this.generateToken({ _id: decoded?._id, email: decoded?.email });
      } else {
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
