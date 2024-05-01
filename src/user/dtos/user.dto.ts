import { IsEmail, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;
}

export class CreateUserResponseDto {
  email: string;
  name: string;
  id: string;
}

export class UsersData {
  name: string;
  email: string;
  id: Types.ObjectId;
}

export class GetAllUsersResponseDto {
  pages: number;
  total: number;
  current: number;
  data: Array<UsersData>;
}
