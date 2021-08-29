import { Router } from 'express';
import ProductsController from '@controllers/products.controller';
import { Routes } from '@interfaces/routes.interface';
import multer from 'multer';

class ProductsRoute implements Routes {
  public path = '/products';
  public router = Router();
  public productsController = new ProductsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.productsController.listProducts);
    this.router.post(`${this.path}`, multer().single('products'), this.productsController.uploadProducts);
  }
}

export default ProductsRoute;
