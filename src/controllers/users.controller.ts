import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/dtos/user.dto';
import { User } from '@interfaces/user.interface';
import userService from '@services/users.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class UsersController {
  public userService = new userService();

  public getUserById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      console.log(req.params);
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
