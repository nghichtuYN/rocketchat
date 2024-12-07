import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Messages')
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('messages.send')
  @UseInterceptors(FileInterceptor('fileAttach'))
  @UseGuards(AuthGuard)
  async create(
    @Req() req,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { sender, roomId } = req.body;

    const parsedSender = JSON.parse(sender);
    const parsedRoomId = JSON.parse(roomId);
    return this.messagesService.create(req, {
      ...createMessageDto,
      sender: parsedSender,
      roomId: parsedRoomId,
      fileUrl: file.destination + '/' + file.filename,
    });
  }
}
