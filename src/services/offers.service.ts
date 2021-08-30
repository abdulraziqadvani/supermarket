import { Offer } from '@/interfaces/offer.interface';
import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';

class OffersService {
  public offers = DB.Offers;
  public products = DB.Products;

  /**
   * Create a new offer with an associated Product ID.
   *
   * @param key - Offer Key which has to be added.
   * @param productId - Product ID with which offer key has to be associated with.
   * @returns - Returns the create object of a Offer.
   */
  public async createOffer(key: string, productId: number): Promise<Offer> {
    const product = this.products.findByPk(productId);
    if (!product) {
      throw new HttpException(412, `Product does not exist with provided ID.`);
    }

    const [offer, created] = await this.offers.findOrCreate({
      where: {
        key,
        product_id: productId,
      },
      defaults: {
        key,
        product_id: productId,
      },
    });

    if (!created) {
      throw new HttpException(412, `Offer already exist for provided Product ID.`);
    }

    return offer;
  }
}

export default OffersService;
