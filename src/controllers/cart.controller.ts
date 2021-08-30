import { NextFunction, Response } from 'express';
import cartService from '@/services/cart.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class CartController {
  public cartService = new cartService();

  /**
   * Add products into the cart of a User.
   *
   * @param {RequestWithUser} req - Request response along with User data.
   * @param {Response} res - Response to be sent to a user.
   * @param {NextFunction} next - For Triggering the next function.
   */
  public addProductIntoCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result = await this.cartService.addProductIntoCart(req.user.id, req.body);

      res.status(200).json({ data: result, message: 'Product added into the cart.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add products into the cart of a User.
   *
   * @param {RequestWithUser} req - Request response along with User data.
   * @param {Response} res - Response to be sent to a user.
   * @param {NextFunction} next - For Triggering the next function.
   */
  public getCurrentCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result = await this.cartService.getCurrentCart(req.user.id);

      res.status(200).json({ data: result, message: 'Current cart information.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate bill of a user cart.
   *
   * @param {RequestWithUser} req - Request response along with User data.
   * @param {Response} res - Response to be sent to a user.
   * @param {NextFunction} next - For Triggering the next function.
   */
  public calculateBill = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result = await this.cartService.calculateBill(req.user.id);

      res.status(200).json({ data: result, message: 'Bill of a user cart.' });
    } catch (error) {
      next(error);
    }
  };

  // public createOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     // const products = req.body.products;

  //     const result = await this.cartService.createOrder(req.user.id, req.body.products);

  //     res.status(201).json({ data: result, message: 'Order added into the cart.' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public listUserOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const orders: Order[] = await this.cartService.listUserOrders(req.user.id);
  //     res.status(200).json({ data: orders, message: 'Orders List' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public checkoutOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const orders = await this.cartService.checkoutOrder(+req.params.id, req.user.id);
      res.status(200).json({ data: orders, message: 'Order Completed' });
    } catch (error) {
      next(error);
    }
  };
}

export default CartController;
