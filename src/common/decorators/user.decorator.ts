import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from '../interfaces/req.interface';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: IRequest = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
