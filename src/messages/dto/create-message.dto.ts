import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  sender: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
  @ApiProperty()
  @IsOptional()
  fileUrl: string;
  @ApiProperty()
  @IsOptional()
  roomId: string;
}
