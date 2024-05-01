import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { IRequest } from '../interfaces/req.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async use(req: IRequest, res: Response, next: NextFunction) {
    let token = req.headers['authorization'] as string;

    if (!token)
      return res.status(401).send({
        statusCode: 401,
        message: 'Unauthorized',
      });

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    try {
      const decoded = await this.authService.verifyAuthToken(token);

      const userExist = await this.userService.findById(decoded.user.id);
      if (!userExist)
        return res.status(401).send({
          statusCode: 401,
          message: 'Unauthorized',
        });

      if (userExist) req.user = Object.assign(userExist, { id: userExist._id });
      next();
    } catch (error) {
      return res.status(401).send({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
  }
}
