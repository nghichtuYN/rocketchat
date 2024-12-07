import { User } from '../../users/users.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  roomName: string;
  @ApiProperty()
  @IsOptional()
  roomType: string;
  @ApiProperty()
  @IsOptional()
  @IsArray()
  members: Array<User>;
  @ApiProperty()
  @IsOptional()
  @IsString()
  avatarUrl?: string;
  @ApiProperty()
  @IsOptional()
  isPrivate?: boolean;
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  owners: Array<User>;
  @ApiProperty()
  @IsOptional()
  @IsString()
  password: string;
}
