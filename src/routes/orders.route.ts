import { Router } from 'express';
import OrdersController from '@controllers/orders.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { CreateOrderDto } from '@/dtos/order.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class ProductsRoute implements Routes {
  public path = '/orders';
  public router = Router();
  public ordersController = new OrdersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/user`, authMiddleware, this.ordersController.listUserOrders);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateOrderDto, 'body'), this.ordersController.createOrder);
  }
}

export default ProductsRoute;
