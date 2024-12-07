import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Rooms } from './rooms.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AddMemberDto } from './dto/add-memer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { RoomJoinDto } from './dto/room-join.dto';

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UsePipes(new ValidationPipe())
  @Post('rooms.create')
  async createRoom(@Body() createRoomDto: CreateRoomDto): Promise<Rooms> {
    return this.roomsService.createRoom(createRoomDto);
  }

  @UseGuards(AuthGuard)
  @Get('rooms.list')
  async getAllRoomsByUser(@Req() req): Promise<Rooms[]> {
    return this.roomsService.getAllRoomsByUser(req);
  }

  @UseGuards(AuthGuard)
  @Get('rooms.info/:rId')
  async getRoomById(@Req() req, @Param('rId') roomId: string): Promise<Rooms> {
    return await this.roomsService.getRoomById(req, roomId);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @Put('rooms.invite/:rId')
  async addMemberToRoom(
    @Req() req,
    @Param('rId') roomId: string,
    @Body() addMemberDTO: AddMemberDto,
  ): Promise<Rooms> {
    return await this.roomsService.addMemberToRoom(req, addMemberDTO, roomId);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  @Put('rooms.status/:rId')
  async updateRoomStatus(
    @Req() req,
    @Param('rId') roomId: string,
    @Body('status') status: string,
  ): Promise<Rooms> {
    return this.roomsService.updateRoomStatus(req, roomId, status);
  }

  @Put('rooms.setAvatar/:rId')
  @UseInterceptors(FileInterceptor('avatar'))
  @UseGuards(AuthGuard)
  async setRoomAvatar(
    @Param('rId') roomId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const ext = extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
    }

    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    const room = await this.roomsService.getRoomById(req, roomId);
    const oldAvatar = room.avatarUrl;

    if (oldAvatar) {
      const oldAvatarPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'rooms',
        oldAvatar.split('/').pop(),
      );
      fs.unlinkSync(oldAvatarPath);
    }
    const avatarUrl = `/uploads/rooms/${file.filename}`;
    await this.roomsService.updateRoomAvatar(req, roomId, avatarUrl);
    return { msg: 'Avatar updated successfully', avatarUrl };
  }

  @UseGuards(AuthGuard)
  @Put('rooms.deleteMember/:rId')
  async deleteMember(
    @Req() req,
    @Param('rId') roomId: string,
    @Body() removeMemberDTO: RemoveMemberDto,
  ) {
    const { room, notFoundMembers } = await this.roomsService.deleteMember(
      req,
      roomId,
      removeMemberDTO,
    );
    if (notFoundMembers.length > 0) {
      throw new HttpException(
        `Not found User(s) with ID(s): ${notFoundMembers.join(', ')} in room`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: 'Member(s) removed successfully',
      room,
    };
  }

  @UseGuards(AuthGuard)
  @Post('rooms.join')
  async joinRoom(@Req() req, @Body() roomJoinDto: RoomJoinDto) {
    await this.roomsService.joinRoom(req, roomJoinDto);
  }

  @UseGuards(AuthGuard)
  @Delete('rooms.delete/:rId')
  async deleteRoom(@Req() req, @Param('rId') roomId: string) {
    await this.roomsService.deleteRoom(req, roomId);
  }
}
