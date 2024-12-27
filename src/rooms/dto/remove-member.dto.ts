import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class RemoveMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  members: Array<string>;
}
