import { ApiProperty } from '@nestjs/swagger';

export class UseSetAvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any; // For Swagger UI file input representation
}
