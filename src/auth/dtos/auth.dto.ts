import { IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/user/dtos/user.dto';

export class SignupDto extends CreateUserDto {}

export class LoginDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  email: string;
  name: string;
  id: string;
  walletBalance: number;
  token: string; // JWT token for subsequent request
}
