import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/users.schema'; // Đảm bảo import đúng User schema
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
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
}
