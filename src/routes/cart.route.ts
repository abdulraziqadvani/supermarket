import { Router } from 'express';
import CartController from '@/controllers/cart.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import getUserActiveCart from '@/middlewares/getUserActiveCart.middleware';
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
    this.router.get(`${this.path}`, authMiddleware, getUserActiveCart, this.cartController.getCartDetails);

    this.router.get(`${this.path}/bill`, authMiddleware, getUserActiveCart, this.cartController.calculateBill);

    this.router.post(`${this.path}/offer`, authMiddleware, getUserActiveCart, validationMiddleware(addOffer, 'body'), this.cartController.addOffer);

    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(addProductIntoCart, 'body'), this.cartController.addProductIntoCart);

    this.router.post(`${this.path}/checkout`, authMiddleware, getUserActiveCart, this.cartController.checkout);
  }
}

export default CartRoute;
