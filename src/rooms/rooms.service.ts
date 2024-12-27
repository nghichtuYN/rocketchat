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
import { RemoveMemberDto } from './dto/remove-member.dto';
import { RoomJoinDto } from './dto/room-join.dto';

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

    if (roomType === 'private') {
      if (!password || password.trim() === '') {
        throw new HttpException(
          'Password for private room cannot be null or empty',
          HttpStatus.BAD_REQUEST,
        );
      }
      const hashedPassword = await this.hashPassword(password);
      const newRoom = new this.roomModel({
        ...roomData,
        isPrivate: true,
        password: hashedPassword,
      });
      return newRoom.save();
    }

    if (password && password.trim() !== '') {
      throw new HttpException(
        'Public rooms cannot have a password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newRoom = new this.roomModel({
      ...roomData,
      isPrivate: false,
      password: null,
    });

    return newRoom.save();
  }

  async getRoomById(req, roomId: string): Promise<Rooms> {
    const room = await this.roomModel
      .findById(roomId)
      .populate({
        path: 'members owners messages',
        populate: {
          path: 'sender',
          select: 'name email avatar',
        },
      })
      .exec();
    if (!room) {
      throw new BadRequestException('Room not found');
    }
    if (!this.checkIsMembers(room, req.user._id)) {
      console.log(typeof req.user._id);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return room;
  }

  async getAllRoomsByUser(req): Promise<Rooms[]> {
    return this.roomModel.find({ members: req.user._id }).exec();
  }

  async addMemberToRoom(
    req,
    addMemberDTO: AddMemberDto,
    roomId: string,
  ): Promise<Rooms> {
    const room = await this.getRoomById(req, roomId);

    const alreadyMembers: string[] = [];

    for (const member of addMemberDTO.members) {
      const user = await this.userModel.findById(member._id).exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${member._id} not found`);
      }

      if (!this.checkIsMembers(room, member._id.toString())) {
        if (!this.checkIsOwners(room, req?.user._id)) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
        room.members.push(user);
      } else {
        alreadyMembers.push(member._id.toString());
      }
    }

    await room.save();

    if (alreadyMembers.length > 0) {
      throw new HttpException(
        `Users with IDs ${alreadyMembers.join(', ')} are already members of the room`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return room;
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
    if (!this.checkIsMembers(room, req.user._id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    room.avatarUrl = avatarUrl;
    return room.save();
  }

  async deleteMember(req, roomId: string, removeMemberDTO: RemoveMemberDto) {
    const room = await this.getRoomById(req, roomId);
    if (!this.checkIsOwners(room, req.user._id)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const notFoundMembers: string[] = [];
    removeMemberDTO.members.forEach((member) => {
      const existingMember = room.members.find(
        (roomMember) => roomMember._id.toString() === member,
      );
      if (!existingMember) {
        notFoundMembers.push(member.toString());
      } else {
        room.members = room.members.filter(
          (roomMember) => roomMember._id.toString() !== member.toString(),
        );
      }
    });
    await room.save();
    return { room, notFoundMembers };
  }

  async joinRoom(req, roomJoinDto: RoomJoinDto): Promise<Rooms> {
    const { roomId, password } = roomJoinDto;

    const [room, user] = await Promise.all([
      this.getRoomById(req, roomId),
      this.userModel.findById(req.user._id).exec(),
    ]);

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    if (!user) {
      throw new HttpException(
        `Not found user with id ${req.user._id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (password) {
      const isPasswordValid = bcrypt.compareSync(password, room.password);
      if (!isPasswordValid) {
        throw new HttpException(
          'Mật khẩu không chính xác',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    if (this.checkIsMembers(room, req.user._id)) {
      throw new HttpException(
        `User with ID ${req.user._id} is already a member of the room`,
        HttpStatus.BAD_REQUEST,
      );
    }

    room.members.push(user);
    await room.save();

    return room;
  }

  async deleteRoom(req, roomId: string) {
    try {
      const room = await this.getRoomById(req, roomId);
      if (!room) {
        throw new BadRequestException('Room not found');
      }
      if (!this.checkIsOwners(room, req.user._id)) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      return await this.roomModel.deleteOne({ _id: roomId });
    } catch {
      throw new NotFoundException(`User with id ${roomId} not found`);
    }
  }
}
