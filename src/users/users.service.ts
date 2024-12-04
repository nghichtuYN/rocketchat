import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { User } from './users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, UpdateResult } from 'mongoose';
import { UserUpdateDto } from './dto/user-update.dto';
import * as bcrypt from 'bcrypt';
import { UserCreateDto } from './dto/user-create.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(query: FilterUserDto): Promise<{
    data: User[];
    total: number;
    page: number;
    lastPage: number;
    prevPage: number | null;
    nextPage: number | null;
  }> {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const offset = (page - 1) * limit;
    const searchQuery = query.search
      ? { name: { $regex: query.search, $options: 'i' } }
      : {};

    const data = await this.userModel
      .find(searchQuery)
      .skip(offset)
      .limit(limit)
      .exec();
    const total = await this.userModel.countDocuments().exec();
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data,
      total,
      page,
      lastPage,
      nextPage,
      prevPage,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash.toString();
  }

  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userModel.findOne({ _id: id }).exec();
  }

  async updateUser(id: string, updateData: UserUpdateDto): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }
    Object.assign(user, updateData);
    return await user.save();
  }

  async createUser(createData: UserCreateDto): Promise<User> {
    const { email, password } = createData;
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('Email đã được sử dụng');
    }
    const hashedPassword = await this.hashPassword(password);

    const newUser = new this.userModel({
      ...createData,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async deleteUser(id: string): Promise<DeleteResult> {
    try {
      return await this.userModel.deleteOne({ _id: id });
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    user.avatar = avatarUrl;
    return await user.save();
  }
}
