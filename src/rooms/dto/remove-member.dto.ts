import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';
import { User } from '../../users/users.schema';

export class RemoveMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  members: Array<User>;
}
