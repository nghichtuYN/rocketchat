import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  first_name: string;
  @Prop()
  last_name: string;
  @Prop()
  email: string;
  @Prop()
  password: string;
  @Prop()
  isAdmin: boolean;
  @Prop()
  isActive: boolean;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(User);
