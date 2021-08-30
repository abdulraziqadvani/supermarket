import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@/dtos/user.dto';
import { User } from '@interfaces/user.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  /**
   * Creates a new user in a Database.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check user credentials and logs-in to the system.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const findUser = await this.authService.login(userData);

      res.status(200).json({ data: findUser, message: 'login' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
