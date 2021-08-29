import { HttpException } from '@/exceptions/HttpException';
import { Offer } from '@/interfaces/offer.interface';
import { Product } from '@/interfaces/product.interface';
import DB from '@databases';
import { Order } from '@interfaces/order.interface';
import { OrderProduct, createOrderProduct } from '@interfaces/order_product.interface';
import config from 'config';

class OrderService {
  public orders = DB.Orders;
  public orderProducts = DB.OrderProducts;
  public offers = DB.Offers;
  public products = DB.Products;

  /**
   * Add products into the cart of a User.
   *
   * @param {number} userId - ID of a User.
   * @param {createOrderProduct} orderProduct - Object of a Product to be added along with count.
   * @returns {void} - Returns nothing.
   */
  public async addProductIntoCart(userId: number, orderProduct: createOrderProduct): Promise<void> {
    const orderStatus = config.get('orderStatus');

    // Get an existing (if any) of a user, else create a new one.
    const [userOrder] = await this.orders.findOrCreate({
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
    const op: OrderProduct = await this.orderProducts.findOne({
      where: {
        order_id: userOrder.id,
        product_id: orderProduct.product_id,
      },
    });

    // If product does not exist in cart then create an entry in DB else update the existing entry.
    if (!op) {
      this.orderProducts.create({
        order_id: userOrder.id,
        product_id: orderProduct.product_id,
        count: orderProduct.count,
      });
    } else {
      this.orderProducts.update(
        { count: orderProduct.count },
        {
          where: {
            order_id: userOrder.id,
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
   * @returns {Promise<{ cart: Order; products: OrderProduct[] }>} - Returns the user cart and it's products.
   */
  public async getCurrentCart(userId: number): Promise<{ cart: Order; products: OrderProduct[] }> {
    const userCart: Order = await this.orders.findOne({
      where: { user_id: userId },
    });

    if (!userCart) {
      throw new HttpException(412, `No cart exist for this user.`);
    }

    const cartProducts: OrderProduct[] = await this.orderProducts.findAll({
      where: { order_id: userCart.id },
    });

    return { cart: userCart, products: cartProducts };
  }

  public async createOrder(userId: number, products: []): Promise<{ order: Order; products: OrderProduct[] }> {
    // if (orderId) {
    //   const order = this.orders.findOne({ where: { id: orderId, user_id: userId } });
    //   if (!order) {
    //     throw new HttpException(412, 'User order not found with provided Order ID.');
    //   }

    //   this.orders.update({}, { where: {} });
    // }

    const order: Order = await this.orders.create(
      {
        user_id: userId,
        status: config.get('orderStatus')['DRAFT'],
      },
      { returning: true },
    );

    for (const element of products) {
      (element as {})['user_id'] = userId;
      (element as {})['order_id'] = order.id;

      if (element['offer']) {
        const offer: Offer = await this.offers
          .findOne({
            where: {
              key: element['offer'],
              product_id: element['product_id'],
            },
          })
          .catch(() => {
            throw new HttpException(412, `Offer not exist with provided code for Product ID ${element['product_id']}`);
          });

        if (!offer) {
          throw new HttpException(412, `Offer not exist with provided code for Product ID ${element['product_id']}`);
        }
        (element as {})['offer_id'] = offer.id;
      }
    }

    const result = await this.orderProducts.bulkCreate(products, { returning: true });

    return { order, products: result };
  }

  public async listUserOrders(userId: number): Promise<Order[]> {
    const products = this.orders.findAll({ where: { user_id: userId } });
    return products;
  }

  public async checkoutOrder(orderId: number, userId: number): Promise<any> {
    const completedStatusKey = config.get('orderStatus')['COMPLETED'];
    const order = await this.orders.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!order) {
      throw new HttpException(412, `Order does not exist with provided ID.`);
    }

    if (order.status === completedStatusKey) {
      throw new HttpException(412, `Order has already being completed.`);
    }

    const orderProducts: OrderProduct[] = await this.orderProducts.findAll({
      where: {
        order_id: order.id,
      },
    });

    const result = {
      subtotal: 0,
      discount: 0,
      total: 0,
    };

    for (const element of orderProducts) {
      const product: Product = await this.products.findByPk(element.product_id);
      const offer: Offer = await this.offers.findByPk(element.offer_id);
      const calPrice = this.calculateProductAmount(product.price, element.count, offer?.key || null);
      result.subtotal += calPrice.subtotal;
      result.discount += calPrice.discount;
      result.total += calPrice.total;
    }

    this.orders.update(
      {
        subtotal: result.subtotal,
        discount: result.discount,
        total: result.total,
        status: completedStatusKey,
      },
      { where: { id: order.id } },
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
