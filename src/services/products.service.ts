import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { Product } from '@interfaces/product.interface';
import { isEmpty } from '@utils/util';

class ProductService {
  public products = DB.Products;

  public async uploadProducts(data: []): Promise<Product[]> {
    return data;
  }
}

export default ProductService;
