import { NextFunction, Response } from 'express';
import { User } from '@interfaces/user.interface';
import userService from '@services/users.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class UsersController {
  public userService = new userService();

  /**
   * Returns the user based on User ID.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public getUserById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;

      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
