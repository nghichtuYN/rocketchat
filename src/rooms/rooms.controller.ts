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
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Rooms } from './rooms.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AddMemberDto } from './dto/add-memer.dto';

@Controller()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UsePipes(new ValidationPipe())
  @Post('rooms.create')
  async createRoom(@Body() createRoomDto: CreateRoomDto): Promise<Rooms> {
    return this.roomsService.createRoom(createRoomDto);
  }

  @Get('room')
  async getAllRooms(): Promise<Rooms[]> {
    return this.roomsService.getAllRooms();
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

    @Put(':roomId/avatar')
    async updateRoomAvatar(
      @Param('roomId') roomId: string,
      @Body('avatarUrl') avatarUrl: string,
    ): Promise<Rooms> {
      return this.roomsService.updateRoomAvatar(roomId, avatarUrl);
    }
  //
  //   // Cập nhật mật khẩu phòng (dành cho phòng private)
  //   @Put(':roomId/password')
  //   async updateRoomPassword(
  //     @Param('roomId') roomId: string,
  //     @Body('password') password: string,
  //   ): Promise<Rooms> {
  //     return this.roomsService.updateRoomPassword(roomId, password);
  //   }
}
