import { NextFunction, Response } from 'express';
import cartService from '@/services/cart.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Cart } from '@/interfaces/cart.interface';
import { CartProduct } from '@/interfaces/cart_product.interface';

class CartController {
  public cartService = new cartService();

  /**
   * Add products into the cart of a User.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
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
   * Get User Active Cart information.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public getCartDetails = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data: CartProduct[] = await this.cartService.getCartProducts(req.user.cart.id);

      const result = { cart: req.user.cart, products: data };

      res.status(200).json({ data: result, message: 'Current cart information.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate bill of a user cart.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public calculateBill = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result: Cart = await this.cartService.calculateBill(req.user.cart.id);

      res.status(200).json({ data: result, message: 'Bill of a user cart.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate bill of a user cart.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public addOffer = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result: Cart = await this.cartService.addOffer(req.user.cart.id, req.body.product_id, req.body.offer_key);

      res.status(200).json({ data: result, message: 'Offer added to a product.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate bill of a user cart.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public checkout = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const result: Cart = await this.cartService.checkout(req.user.cart.id);

      res.status(200).json({ data: result, message: 'Cart has been checked out.' });
    } catch (error) {
      next(error);
    }
  };
}

export default CartController;
