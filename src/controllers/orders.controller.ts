import { NextFunction, Request, Response } from 'express';
import { Order } from '@interfaces/order.interface';
import orderService from '@services/orders.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class OrdersController {
  public orderService = new orderService();

  /**
   * Add products into the cart of a User.
   *
   * @param {RequestWithUser} req - Request response along with User data.
   * @param {Response} res - Response to be sent to a user.
   * @param {NextFunction} next - For Triggering the next function.
   */
  public addProductIntoCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result = await this.orderService.addProductIntoCart(req.user.id, req.body);

      res.status(201).json({ data: result, message: 'Product added into the cart.' });
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
      const result = await this.orderService.getCurrentCart(req.user.id);

      res.status(201).json({ data: result, message: 'Current cart information.' });
    } catch (error) {
      next(error);
    }
  };

  public createOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // const products = req.body.products;

      const result = await this.orderService.createOrder(req.user.id, req.body.products);

      res.status(201).json({ data: result, message: 'Order added into the cart.' });
    } catch (error) {
      next(error);
    }
  };

  public listUserOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const orders: Order[] = await this.orderService.listUserOrders(req.user.id);
      res.status(200).json({ data: orders, message: 'Orders List' });
    } catch (error) {
      next(error);
    }
  };

  public checkoutOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const orders = await this.orderService.checkoutOrder(+req.params.id, req.user.id);
      res.status(200).json({ data: orders, message: 'Order Completed' });
    } catch (error) {
      next(error);
    }
  };
}

export default OrdersController;
