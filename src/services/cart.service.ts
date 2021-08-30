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
   * @param {number} userId - ID of a User.
   * @param {createCartProduct} orderProduct - Object of a Product to be added along with count.
   * @returns {void} - Returns nothing.
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
   * Returns the current cart of a User.
   *
   * @param {number} userId - ID of a User.
   * @returns {Promise<{ cart: Order; products: CartProduct[] }>} - Returns the user cart and it's products.
   */
  public async getCurrentCart(userId: number): Promise<{ cart: Cart; products: CartProduct[] }> {
    // Check if has any active cart exist.
    const userCart: Cart = await this.cart.findOne({
      where: { user_id: userId },
    });

    // Throws an if no active cart exist.
    if (!userCart) {
      throw new HttpException(412, `No cart exist for this user.`);
    }

    // Get Product ID associated with a cart.
    const cartProducts: CartProduct[] = await this.cartProducts.findAll({
      where: { cart_id: userCart.id },
    });

    return { cart: userCart, products: cartProducts };
  }

  /**
   * Generate bill of a user cart.
   *
   * @param {number} userId - ID of a User.
   * @returns {Cart} - Returns the cart object after calculating the bill.
   */
  public async calculateBill(userId: number): Promise<Cart> {
    // Check if has any active cart exist.
    let userCart: Cart = await this.cart.findOne({
      where: { user_id: userId },
    });

    // Throws an if no active cart exist.
    if (!userCart) {
      throw new HttpException(412, `No cart exist for this user.`);
    }

    // Get Product ID associated with a cart.
    const cartProducts: CartProduct[] = await this.cartProducts.findAll({
      where: {
        cart_id: userCart.id,
      },
    });

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
    userCart = await this.cart
      .update(
        {
          subtotal: result.subtotal,
          discount: result.discount,
          total: result.total,
        },
        {
          where: { id: userCart.id },
          returning: true,
        },
      )
      .then(([, savedRecord]) => savedRecord[0]);

    return userCart;
  }

  /**
   * Apply an offer to a Product in a User Cart.
   * If `offerKey` is provided then it will associate `offer_id` else will remove offer from User Product in a Cart.
   *
   * @param {number} userId - ID of a User.
   * @param {number} productId - ID of a Product.
   * @param {string} offerKey - Key of a Offer.
   * @returns {Cart} - Returns the update cart information of a User.
   */
  public async addOffer(userId: number, productId: number, offerKey?: string): Promise<Cart> {
    // Check if has any active cart exist.
    const userCart: Cart = await this.cart.findOne({
      where: { user_id: userId },
    });

    // Throws an if no active cart exist.
    if (!userCart) {
      throw new HttpException(412, `No cart exist for this user.`);
    }

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
        cart_id: userCart.id,
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
          cart_id: userCart.id,
          product_id: productId,
        },
      },
    );

    // Recalculate user bill and returns it.
    const bill: Cart = await this.calculateBill(userId);

    return bill;
  }

  /**
   * Mark the user cart to complete and checkout.
   *
   * @param {number} userId - ID of a User.
   * @returns {Cart} - Returns the update cart information of a User.
   */
  public async checkout(userId: number): Promise<Cart> {
    const orderStatus = config.get('orderStatus');

    // Check if has any active cart exist.
    const userCart: Cart = await this.cart.findOne({
      where: { user_id: userId },
    });

    // Throws an if no active cart exist.
    if (!userCart) {
      throw new HttpException(412, `No cart exist for this user.`);
    }

    // Check if user has generated the bill.
    if ([userCart.subtotal, userCart.discount, userCart.total].includes(null)) {
      throw new HttpException(412, `Kindly regenerate your bill.`);
    }

    // Update the cart of a user and mark as Complete.
    const cart: Cart = await this.cart
      .update(
        {
          status: orderStatus['COMPLETED'],
        },
        { where: { id: userCart.id }, returning: true },
      )
      .then(([, savedRecord]) => savedRecord[0]);

    return cart;
  }

  // public async createOrder(userId: number, products: []): Promise<{ order: Order; products: CartProduct[] }> {
  //   // if (orderId) {
  //   //   const order = this.orders.findOne({ where: { id: orderId, user_id: userId } });
  //   //   if (!order) {
  //   //     throw new HttpException(412, 'User order not found with provided Order ID.');
  //   //   }

  //   //   this.orders.update({}, { where: {} });
  //   // }

  //   const order: Cart = await this.orders.create(
  //     {
  //       user_id: userId,
  //       status: config.get('orderStatus')['DRAFT'],
  //     },
  //     { returning: true },
  //   );

  //   for (const element of products) {
  //     (element as {})['user_id'] = userId;
  //     (element as {})['order_id'] = order.id;

  //     if (element['offer']) {
  //       const offer: Offer = await this.offers
  //         .findOne({
  //           where: {
  //             key: element['offer'],
  //             product_id: element['product_id'],
  //           },
  //         })
  //         .catch(() => {
  //           throw new HttpException(412, `Offer not exist with provided code for Product ID ${element['product_id']}`);
  //         });

  //       if (!offer) {
  //         throw new HttpException(412, `Offer not exist with provided code for Product ID ${element['product_id']}`);
  //       }
  //       (element as {})['offer_id'] = offer.id;
  //     }
  //   }

  //   const result = await this.cartProducts.bulkCreate(products, { returning: true });

  //   return { order, products: result };
  // }

  // public async listUserOrders(userId: number): Promise<Order[]> {
  //   const products = this.orders.findAll({ where: { user_id: userId } });
  //   return products;
  // }

  public async checkoutOrder(orderId: number, userId: number): Promise<any> {
    const completedStatusKey = config.get('orderStatus')['COMPLETED'];
    const cart = await this.cart.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!cart) {
      throw new HttpException(412, `Order does not exist with provided ID.`);
    }

    if (cart.status === completedStatusKey) {
      throw new HttpException(412, `Order has already being completed.`);
    }

    const cartProducts: CartProduct[] = await this.cartProducts.findAll({
      where: {
        cart_id: cart.id,
      },
    });

    const result = {
      subtotal: 0,
      discount: 0,
      total: 0,
    };

    for (const element of cartProducts) {
      const product: Product = await this.products.findByPk(element.product_id);
      const offer: Offer = await this.offers.findByPk(element.offer_id);
      const calPrice = this.calculateProductAmount(product.price, element.count, offer?.key || null);
      result.subtotal += calPrice.subtotal;
      result.discount += calPrice.discount;
      result.total += calPrice.total;
    }

    this.cart.update(
      {
        subtotal: result.subtotal,
        discount: result.discount,
        total: result.total,
        status: completedStatusKey,
      },
      { where: { id: cart.id } },
    );

    return result;
  }

  public calculateProductAmount(
    productAmount: number,
    productCount: number,
    offerKey?: string,
  ): { subtotal: number; discount: number; total: number } {
    const offersKey = config.get('offers');
    let chargeCount: number;
    let chargeAmount: number = productAmount * productCount;

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

    const result = {
      subtotal: productAmount * productCount,
      discount: productAmount * productCount - chargeAmount,
      total: chargeAmount,
    };

    return result;
  }
}

export default OrderService;
