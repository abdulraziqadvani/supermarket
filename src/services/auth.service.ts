import bcrypt from 'bcrypt';
import DB from '@databases';
import { CreateUserDto } from '@/dtos/user.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/user.interface';
import { isEmpty } from '@utils/util';
import generateJwtToken from '@utils/generateJwtToken';

class AuthService {
  public users = DB.Users;

  /**
   * Creates a new user in a Database.
   *
   * @param userData - Data of a User.
   * @returns Returns the new user Data.
   */
  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const createUserData: User = (await this.users.create({ ...userData, password: hashedPassword })).get({ plain: true });

    (createUserData as any).token = generateJwtToken({ id: createUserData.id });

    return createUserData;
  }

  /**
   * Check user credentials and logs-in to the system.
   *
   * @param userData - Data of a User.
   * @returns Returns the user data.
   */
  public async login(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    (findUser as any).token = generateJwtToken({ id: findUser.id });

    return findUser;
  }
}

export default AuthService;
