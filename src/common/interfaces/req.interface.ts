import { Request } from 'express';
import { User } from 'src/user/schemas/user.schema';

export interface IRequest extends Request {
  user?: User;
}
