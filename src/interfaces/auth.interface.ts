import { Request } from 'express';
import { UserDetailed } from '@interfaces/user.interface';

export interface DataStoredInToken {
  id: number;
}

export interface RequestWithUser extends Request {
  user: UserDetailed;
}
