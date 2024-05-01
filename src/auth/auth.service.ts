import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { LoginDto, LoginResponseDto } from './dtos/auth.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async handleLogin(payload: LoginDto): Promise<LoginResponseDto> {
    const userExist = await this.userService.findByEmail(payload.email);
    if (!userExist)
      throw new BadRequestException('Invalid login details, pls try again');
    const passwordMatch = await this.comparePassword(
      payload.password,
      userExist.password,
    );
    if (!passwordMatch)
      throw new BadRequestException('Invalid login details, pls try again');

    const token = await this.generateJwt({
      email: userExist.email,
      id: userExist.id,
      name: userExist.name,
    });

    return {
      email: userExist.email,
      id: userExist.id,
      name: userExist.name,
      walletBalance: userExist.walletBalance,
      token,
    };
  }

  private generateJwt(user: {
    email: string;
    id: string;
    name: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { user },
        process.env.JWT_SECRET,
        (err: any, token: string | PromiseLike<string>) => {
          if (err) reject(err);
          resolve(token);
        },
      );
    });
  }

  private async comparePassword(
    payloadPassword,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(payloadPassword, userPassword);
  }

  public verifyAuthToken(token: string): Promise<jwt.JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded: any) => {
        if (err) reject();
        else {
          if (!decoded.user) reject(new UnauthorizedException());
          resolve(decoded);
        }
      });
    });
  }
}
