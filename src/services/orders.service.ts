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

import DB from '@databases';
import { Order } from '@interfaces/order.interface';
import { OrderProduct } from '@interfaces/order_product.interface';
import config from 'config';

class OrderService {
  public orders = DB.Orders;
  public orderProducts = DB.OrderProducts;

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

    products.forEach(element => {
      (element as {})['user_id'] = userId;
      (element as {})['order_id'] = order.id;
    });

    const result = await this.orderProducts.bulkCreate(products, { returning: true });

    return { order, products: result };
  }

  public async listUserOrders(userId: number): Promise<Order[]> {
    const products = this.orders.findAll({ where: { user_id: userId } });
    return products;
  }
}

export default OrderService;
