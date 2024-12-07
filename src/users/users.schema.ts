import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;
  @Prop({ required: true })
  username: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  name: string;
  @Prop({ default: 'offline' })
  status: string;
  @Prop({ default: true })
  active: boolean;
  @Prop({ default: 'user' })
  role: string;
  @Prop({ default: null, nullable: true })
  avatar: string;
}

export const UsersSchema = SchemaFactory.createForClass(User);
