import {
  Controller,
  Get,
  Request,
  HttpException,
  HttpStatus,
  UseGuards,
  Param,
  Body,
  Put,
  Post,
  UsePipes,
  ValidationPipe,
  Delete,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { User } from './users.schema';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import {
  ApiBearerAuth,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@ApiBearerAuth()
@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  // @Api({ name: 'search' })
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Get('users.list')
  async findAll(@Query() query: FilterUserDto, @Request() req) {
    try {
      // if (req.user?.role !== 'admin') {
      //   throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      // }
      return await this.usersService.findAll(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(AuthGuard)
  @Get('users.info/:id')
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<User> {
    try {
      if (req.user?._id !== id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return await this.usersService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(AuthGuard)
  @Put('users.update/:id')
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UserUpdateDto,
    @Request() req: any,
  ) {
    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?._id === id;

    if (!isAdmin && !isSelf) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.usersService.updateUser(id, updateData);
  }

  @Post('users.create')
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @UsePipes(new ValidationPipe())
  async creatUser(@Body() createData: UserCreateDto): Promise<User> {
    return this.usersService.createUser(createData);
  }

  @UseGuards(AuthGuard)
  @Delete('users.delete/:id')
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  async deleteUser(@Param('id') id: string, @Req() req) {
    if (req.user?._id !== id && req.user?.role !== 'admin') {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return await this.usersService.deleteUser(id);
  }

  @UseGuards(AuthGuard)
  @Post('users.setAvatar/:id')
  @ApiResponse({ status: HttpStatus.OK, description: 'OK' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('avatar'))
  async setUserAvatar(
    @Param('id') id: string,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const ext = extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
    }
    if (id !== req.user._id) {
      console.log(req.user._id);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    const user = await this.usersService.findOne(id);
    const oldAvatar = user.avatar;

    if (oldAvatar) {
      const oldAvatarPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'avatar',
        oldAvatar.split('/').pop(),
      );
      fs.unlinkSync(oldAvatarPath);
    }
    const avatarUrl = `/uploads/avatar/${file.filename}`;
    await this.usersService.updateUserAvatar(id, avatarUrl);
    return { message: 'Avatar updated successfully', avatarUrl };
  }
}
