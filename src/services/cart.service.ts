import { HttpException } from '@/exceptions/HttpException';
import { Offer } from '@/interfaces/offer.interface';
import { Product } from '@/interfaces/product.interface';
import DB from '@databases';
import { Cart } from '@/interfaces/cart.interface';
import { CartProduct, createCartProduct } from '@interfaces/cart_product.interface';
import config from 'config';

class OrderService {
  public cart = DB.Cart;
  public cartProducts = DB.CartProducts;
  public offers = DB.Offers;
  public products = DB.Products;

  /**
   * Add products into the cart of a User.
   *
   * @param userId - ID of a User.
   * @param orderProduct - Object of a Product to be added along with count.
   * @returns Returns nothing.
   */
  public async addProductIntoCart(userId: number, orderProduct: createCartProduct): Promise<void> {
    const orderStatus = config.get('orderStatus');

    // Get an existing (if any) of a user, else create a new one.
    const [userCart] = await this.cart.findOrCreate({
      where: {
        user_id: userId,
        status: orderStatus['DRAFT'],
      },
      defaults: {
        user_id: userId,
      },
    });

    // Verify product exist with a provided ID.
    const product: Product = await this.products.findByPk(orderProduct.product_id);
    if (!product) {
      throw new HttpException(412, `Product does not exist with ID ${orderProduct.product_id}`);
    }

    // Verify product stock is available.
    if (product.available < orderProduct.count) {
      throw new HttpException(412, `Unable to add product into cart. Only ${product.available} piece(s) are available.`);
    }

    // Check if a product is already into the cart.
    const op: CartProduct = await this.cartProducts.findOne({
      where: {
        cart_id: userCart.id,
        product_id: orderProduct.product_id,
      },
    });

    // If product does not exist in cart then create an entry in DB else update the existing entry.
    if (!op) {
      this.cartProducts.create({
        cart_id: userCart.id,
        product_id: orderProduct.product_id,
        count: orderProduct.count,
      });
    } else {
      this.cartProducts.update(
        { count: orderProduct.count },
        {
          where: {
            cart_id: userCart.id,
            product_id: orderProduct.product_id,
          },
        },
      );
    }

    return null;
  }

  /**
   * Returns the Products in a cart.
   *
   * @param cartId - ID of a cart.
   * @returns Returns the Products within a Specific Cart.
   */
  public async getCartProducts(cartId: number): Promise<CartProduct[]> {
    // Get Product ID associated with a cart.
    const cartProducts: CartProduct[] = await this.cartProducts.findAll({
      where: { cart_id: cartId },
    });

    return cartProducts;
  }

  /**
   * Generate bill of a cart.
   *
   * @param cartId - ID of a Cart.
   * @returns Returns the cart object after calculating the bill.
   */
  public async calculateBill(cartId: number): Promise<Cart> {
    // Get Product ID associated with a cart.
    const cartProducts: CartProduct[] = await this.getCartProducts(cartId);

    const result = {
      subtotal: 0,
      discount: 0,
      total: 0,
    };

    // Iterate through a Product Ids.
    for (const element of cartProducts) {
      // Get Product data based on it's ID.
      const product: Product = await this.products.findByPk(element.product_id);

      // Get Offer data based on it's ID.
      const offer: Offer = await this.offers.findByPk(element.offer_id);

      // Calculate price based on product price, count and offer key.
      const calPrice = this.calculateProductAmount(product.price, element.count, offer?.key || null);

      result.subtotal += calPrice.subtotal;
      result.discount += calPrice.discount;
      result.total += calPrice.total;
    }

    // Update the bill of a user cart.
    const cart = await this.cart
      .update(
        {
          subtotal: result.subtotal,
          discount: result.discount,
          total: result.total,
        },
        {
          where: { id: cartId },
          returning: true,
        },
      )
      .then(([, savedRecord]) => savedRecord[0]);

    return cart;
  }

  /**
   * Apply an offer to a Product in a Cart.
   * If `offerKey` is provided then it will associate `offer_id` else will remove offer from User Product in a Cart.
   *
   * @param cartId - ID of a Cart.
   * @param productId - ID of a Product.
   * @param offerKey - Key of a Offer.
   * @returns Returns the update cart information of a User.
   */
  public async addOffer(cartId: number, productId: number, offerKey?: string): Promise<Cart> {
    let offer: Offer;

    if (offerKey) {
      // Check if offer exist with provided Key.
      offer = await this.offers
        .findOne({
          where: {
            key: offerKey,
            product_id: productId,
          },
        })
        .catch(() => {
          throw new HttpException(412, `Offer not exist with provided code for Product ID ${productId}`);
        });

      if (!offer) {
        throw new HttpException(412, `Offer not exist with provided code for Product ID ${productId}`);
      }
    }

    // Check if user has a Product in his cart, on which s/he is applying an offer.
    const cartProduct: CartProduct = await this.cartProducts.findOne({
      where: {
        cart_id: cartId,
        product_id: productId,
      },
    });

    if (!cartProduct) {
      throw new HttpException(412, `You need to first add this product into your cart to apply this offer.`);
    }

    // Update offer_id on Product of a User Cart.
    await this.cartProducts.update(
      { offer_id: offer?.id || null },
      {
        where: {
          cart_id: cartId,
          product_id: productId,
        },
      },
    );

    // Recalculate user bill and returns it.
    const bill: Cart = await this.calculateBill(cartId);

    return bill;
  }

  /**
   * Mark the user cart to complete and checkout.
   *
   * @param cartId - ID of a Cart.
   * @returns Returns the update cart information of a User.
   */
  public async checkout(cartId: number): Promise<Cart> {
    const orderStatus = config.get('orderStatus');

    // Check if has any active cart exist.
    let cart: Cart = await this.cart.findOne({
      where: { id: cartId },
    });

    const cartProducts: CartProduct[] = await this.getCartProducts(cartId);

    // Check if user has generated the bill.
    if ([cart.subtotal, cart.discount, cart.total].includes(null)) {
      throw new HttpException(412, `Kindly regenerate your bill.`);
    }

    // Update the cart of a user and mark as Complete.
    cart = await this.cart
      .update(
        {
          status: orderStatus['COMPLETED'],
        },
        { where: { id: cart.id }, returning: true },
      )
      .then(([, savedRecord]) => savedRecord[0]);

    for (const element of cartProducts) {
      await this.products.increment({ available: -element.count }, { where: { id: element.product_id } });
    }

    return cart;
  }

  /**
   * Calculate Price of a Product.
   *
   * @param productAmount - Price of a Product.
   * @param productCount - Number of pieces of a specific Product.
   * @param offerKey - Offer applied to a Product.
   * @returns Returns Subtotal, Discount, Total Price for the specific Product.
   */
  public calculateProductAmount(
    productAmount: number,
    productCount: number,
    offerKey?: string,
  ): { subtotal: number; discount: number; total: number } {
    const offersKey = config.get('offers');
    let chargeCount: number;
    let chargeAmount: number = productAmount * productCount;

    // Check if any offer is applied to a product.
    if (offerKey) {
      switch (offerKey) {
        case offersKey['BUY_2_GET_1_FREE']:
          chargeCount = productCount - Math.floor(productCount / 3);
          chargeAmount = chargeCount * productAmount;
          break;
        case offersKey['BUY_1_GET_HALF_OFF']:
          const halfCount = Math.floor(productCount / 2);
          chargeCount = productCount - halfCount;
          chargeAmount = chargeCount * productAmount + halfCount * (productAmount / 2);
          break;
      }
    }

    // Calculate Result and returns.
    const result = {
      subtotal: productAmount * productCount,
      discount: productAmount * productCount - chargeAmount,
      total: chargeAmount,
    };

    return result;
  }
}

export default OrderService;
