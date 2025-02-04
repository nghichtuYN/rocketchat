import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './messages.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/users.schema';
import { RoomsService } from '../rooms/rooms.service';
import { ChatroomGateway } from '../chatroom/chatroom.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    private roomService: RoomsService,
    private chatroomGateway: ChatroomGateway,
  ) {}

  async create(req, createMessageDto: CreateMessageDto) {
    const { sender, roomId, fileUrl } = createMessageDto;
    console.log(roomId);
    if (req.user._id !== sender) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const room = await this.roomService.getRoomById(req, roomId);
    if (!room) {
      throw new HttpException('Not found room ', HttpStatus.BAD_REQUEST);
    }

    const newMessages = new this.messageModel({
      ...createMessageDto,
      messageType: fileUrl ? 'text' : 'content',
    });
    await newMessages.save();
    const newMsg = await this.messageModel
      .findById(newMessages?._id.toString())
      .populate({
        path: 'sender',
        select: 'name email avatar',
      })
      .exec();
    console.log(newMsg);
    console.log(newMessages?._id);
    room.messages.push(newMessages);
    await room.save();
    // console.log(roomId);
    const client = this.chatroomGateway.getClientIdByUserId(sender);
    if (client) {
      console.log(`Found clientId for userId`);
    } else {
      console.log(`No clientId found for userId`);
    }
    this.chatroomGateway.syncDataToRoom(client, roomId, 'newMessage', newMsg);
    return newMessages;
  }
}
