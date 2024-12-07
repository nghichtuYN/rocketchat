import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../users/users.schema';
import { Rooms } from '../rooms/rooms.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Rooms', required: true })
  roomId: Rooms;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ nullable: true, default: null })
  content: string;

  @Prop({ required: true })
  messageType: string;

  @Prop({ default: null })
  fileUrl: string | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
