import { NextFunction, Request, Response } from 'express';
import { Order } from '@interfaces/order.interface';
import orderService from '@services/orders.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class OrdersController {
  public orderService = new orderService();

  public createOrder = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // const products = req.body.products;

      const result = await this.orderService.createOrder(req.user.id, req.body.products);

      console.log(result);

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
}

export default OrdersController;
