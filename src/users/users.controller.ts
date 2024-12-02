import {
  Controller,
  Get,
  Request,
  HttpException,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import { User } from './users.schema';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users.list')
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NO_CONTENT);
    }
  }

  @UseGuards(AuthGuard)
  @Get('users.info/:id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<User> {
    try {
      if (req.user?._id !== id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
