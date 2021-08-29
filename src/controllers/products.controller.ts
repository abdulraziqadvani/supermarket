import { NextFunction, Request, Response } from 'express';
import { Product } from '@interfaces/product.interface';
import productService from '@services/products.service';
import csv from 'csvtojson';

class ProductsController {
  public productService = new productService();

  public listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products: Product[] = await this.productService.listProducts();
      res.status(200).json({ data: products, message: 'Products List' });
    } catch (error) {
      next(error);
    }
  };

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
