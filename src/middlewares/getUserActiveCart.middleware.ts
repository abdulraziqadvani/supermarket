import { NextFunction, Response } from 'express';
import config from 'config';
import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Cart } from '@/interfaces/cart.interface';

const getCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const orderStatus = config.get('orderStatus');

    // Check if has any active cart exist.
    const userCart: Cart = await DB.Cart.findOne({
      where: {
        user_id: req.user.id,
        status: orderStatus['DRAFT'],
      },
    });

    // Throws an if no active cart exist.
    if (!userCart) {
      throw new HttpException(412, `No cart exist for this user.`);
    }

    req.user.cart = userCart;
    next();
  } catch (error) {
    next(error);
  }
};

export default getCart;
