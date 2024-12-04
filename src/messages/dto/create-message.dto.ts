import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/users.schema';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  sender: User;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
  @ApiProperty()
  @IsOptional()
  fileUrl: string;

}
