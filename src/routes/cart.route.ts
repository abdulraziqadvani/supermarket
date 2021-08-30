import { Router } from 'express';
import CartController from '@/controllers/cart.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import { addProductIntoCart, addOffer } from '@/dtos/cart.dto';
import validationMiddleware from '@/middlewares/validation.middleware';

class CartRoute implements Routes {
  public path = '/cart';
  public router = Router();
  public cartController = new CartController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get(`${this.path}/user`, authMiddleware, this.cartController.listUserOrders);
    this.router.get(`${this.path}`, authMiddleware, this.cartController.getCurrentCart);
    this.router.get(`${this.path}/bill`, authMiddleware, this.cartController.calculateBill);
    // this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateOrderDto, 'body'), this.cartController.createOrder);
    this.router.post(`${this.path}/offer`, authMiddleware, validationMiddleware(addOffer, 'body'), this.cartController.addOffer);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(addProductIntoCart, 'body'), this.cartController.addProductIntoCart);
    this.router.post(`${this.path}/checkout`, authMiddleware, this.cartController.checkout);
    this.router.post(`${this.path}/checkout/:id(\\d+)`, authMiddleware, this.cartController.checkoutOrder);
  }
}

export default CartRoute;
