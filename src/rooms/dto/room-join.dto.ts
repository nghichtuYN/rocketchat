import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class RoomJoinDto {
  @ApiProperty()
  @IsNotEmpty()
  roomId: string;

  @IsOptional()
  @ApiProperty()
  password: string;
}
