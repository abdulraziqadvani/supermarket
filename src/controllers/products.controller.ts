import { NextFunction, Request, Response } from 'express';
import { CreateProductDto } from '@/dtos/product.dto';
import { Product } from '@interfaces/product.interface';
import productService from '@services/products.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class ProductsController {
  public productService = new productService();

  public uploadProducts = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ data: null, message: 'Products Uploaded' });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductsController;
