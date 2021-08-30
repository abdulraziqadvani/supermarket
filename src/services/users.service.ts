import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/user.interface';
import { isEmpty } from '@utils/util';

class UserService {
  public users = DB.Users;

  /**
   * Returns the user based on User ID.
   *
   * @param userId - ID of a User.
   * @returns Returns the user data.
   */
  public async findUserById(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }
}

export default UserService;
