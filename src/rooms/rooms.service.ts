import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rooms } from './rooms.schema';
import { User } from '../users/users.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import * as bcrypt from 'bcrypt';
import { AddMemberDto } from './dto/add-memer.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Rooms.name) private roomModel: Model<Rooms>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash.toString();
  }

  private checkIsOwners(room: Rooms, userId: string): boolean {
    return room.owners.map((user) => user._id.toString()).includes(userId);
  }

  private checkIsMembers(room: Rooms, userId: string): boolean {
    return room.members.map((user) => user._id.toString()).includes(userId);
  }

  async createRoom(roomData: CreateRoomDto): Promise<Rooms> {
    const { roomType, password } = roomData;
    if (roomType === 'private' && password) {
      const hashedPassword = await this.hashPassword(password);
      const newRoom = new this.roomModel({
        ...roomData,
        isPrivate: true,
        password: hashedPassword,
      });
      return await newRoom.save();
    }
    const newRoom = new this.roomModel(roomData);
    return newRoom.save();
  }

  async getRoomById(req, roomId: string): Promise<Rooms> {
    const room = await this.roomModel
      .findById(roomId)
      .populate('members owners messages')
      .exec();
    if (!room) {
      throw new BadRequestException('Room not found');
    }
    if (!this.checkIsMembers(room, req.user._id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return room;
  }

  async getAllRooms(): Promise<Rooms[]> {
    return this.roomModel.find().populate('members messages');
  }

  async addMemberToRoom(
    req,
    addMemberDTO: AddMemberDto,
    roomId: string,
  ): Promise<Rooms> {
    const room = await this.getRoomById(req, roomId);
    for (const memberId of addMemberDTO.members) {
      const user = await this.userModel.findById(memberId).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${memberId} not found`);
      }
      if (!this.checkIsMembers(room, memberId)) {
        if (!this.checkIsOwners(room, req?.user._id)) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        room.members.push(user);
      } else {
        throw new Error(
          `User with ID ${memberId} is already a member of the room`,
        );
      }
    }

    return await room.save();
  }

  async updateRoomStatus(req, roomId: string, status: string): Promise<Rooms> {
    const room = await this.getRoomById(req, roomId);
    room.status = status;
    return room.save();
  }

  async updateRoomAvatar(
    req,
    roomId: string,
    avatarUrl: string,
  ): Promise<Rooms> {
    const room = await this.getRoomById(req, roomId);
    room.avatarUrl = avatarUrl;
    return room.save();
  }

  // Cập nhật mật khẩu phòng (dành cho phòng private)
  async updateRoomPassword(
    req,
    roomId: string,
    password: string,
  ): Promise<Rooms> {
    const room = await this.getRoomById(req, roomId);
    if (room.isPrivate) {
      room.password = password;
      return room.save();
    }
    throw new Error('Room is not private');
  }
}
