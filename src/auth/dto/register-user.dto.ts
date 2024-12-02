import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  password: string;
}
