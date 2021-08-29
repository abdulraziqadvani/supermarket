// buy_2_get_1_free, 1 (egg)

// cart = [];
// egg, 3, buy_2_get_1_free

// cart.forEach((element) => {
//     result = orm(offer.exist && offer.productId == egg);
//     if (result) {
//         offserParcel();
//     }
// });

// [
//     {
//         itemId: egg
//         count: 3
//         coupon: ''
//     },
//     {
//         itemId: bread
//         count: 3
//         coupon: ''
//     }
// ]

// offerParcel(offerKey, productAmount, productCount) {
//     switch offerKey {
//         case buy_2_get_1_free:
//             const chargeCount = productCount - Math.floor(productCount/3);
//             const chargeAmount = chargeCount * productAmount
//             return chargeAmount;
//         break;
//         case buy_1_get_half_off:
//             const halfCount = Math.floor(productCount/2);
//             const chargeCount = productCount - halfCount;
//             const chargeAmount = (chargeCount * productAmount) + (halfCount * (productAmount / 2));
//             return chargeAmount;
//         break;
//     }
// }

import { HttpException } from '@/exceptions/HttpException';
import { Offer } from '@/interfaces/offer.interface';
import { Product } from '@/interfaces/product.interface';
import DB from '@databases';
import { Order } from '@interfaces/order.interface';
import { OrderProduct } from '@interfaces/order_product.interface';
import config from 'config';

class OrderService {
  public orders = DB.Orders;
  public orderProducts = DB.OrderProducts;
  public offers = DB.Offers;
  public products = DB.Products;

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
