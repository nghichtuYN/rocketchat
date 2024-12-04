import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Message } from '../messages/messages.schema';
import { User } from '../users/users.schema';

@Schema({ timestamps: true })
export class Rooms extends Document {
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', required: true })
  members: User[];

  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true, enum: ['group', 'private'], default: 'group' })
  roomType: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Message' })
  messages: Message[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'User',
    required: false,
    nullable: true,
  })
  owners: User[];

  @Prop({ nullable: true, default: null })
  avatarUrl: string | null;

  @Prop({ default: true })
  notificationsEnabled: boolean;

  @Prop({ nullable: true, default: null })
  fileUrl: string | null;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ nullable: true, default: null })
  password: string | null;
}

export const RoomsSchema = SchemaFactory.createForClass(Rooms);
