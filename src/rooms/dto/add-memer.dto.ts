import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  members: string[];
}
