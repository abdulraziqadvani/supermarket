import { NextFunction, Request, Response } from 'express';
import { Product } from '@interfaces/product.interface';
import productService from '@services/products.service';
import csv from 'csvtojson';

class ProductsController {
  public productService = new productService();

  /**
   * List Products.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products: Product[] = await this.productService.listProducts();
      res.status(200).json({ data: products, message: 'Products List' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Products data and save it into Database.
   *
   * @param req - Request response along with User data.
   * @param res - Response to be sent to a user.
   * @param next - For Triggering the next function.
   */
  public uploadProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file: string = req.file.buffer.toString('utf8');

      const fileData: Product[] = await csv()
        .fromString(file)
        .then(fileObj => {
          fileObj.forEach(element => {
            element.price = +element.price;
            element.available = +element.available;
          });
          return fileObj;
        });

      const products: Product[] = await this.productService.uploadProducts(fileData);

      res.status(200).json({ data: products, message: 'Products Uploaded' });
    } catch (error) {
      next(error);
    }
  };
}

export default ProductsController;
