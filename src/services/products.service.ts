import { HttpException } from '@/exceptions/HttpException';
import DB from '@databases';
import { Product } from '@interfaces/product.interface';

class ProductService {
  public products = DB.Products;

  /**
   * List Products.
   *
   * @returns - Returns the list of a Products.
   */
  public async listProducts(): Promise<Product[]> {
    const products = this.products.findAll();
    return products;
  }

  /**
   * Get Products data and save it into Database.
   *
   * @param data - Products data needed to be added in Database.
   * @returns Returns the result after uploading in Database.
   */
  public async uploadProducts(data: Product[]): Promise<Product[]> {
    const result = this.products
      .bulkCreate(data)
      .then(res => res)
      .catch(err => {
        throw new HttpException(400, `${err.errors[0].value} ${err.errors[0].message}`);
      });
    return result;
  }
}

export default ProductService;
