import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { OrderProduct } from '@interfaces/order_product.interface';
// import { ProductModel } from '@models/product.model';
// import { OrderModel } from '@models/order.model';
// import { OfferModel } from '@models/offer.model';

export type OrderProductCreationAttributes = Optional<
  OrderProduct,
  'id' | 'order_id' | 'product_id' | 'count' | 'offer_id' | 'subtotal' | 'discount' | 'total'
>;

export class OrderProductModel extends Model<OrderProduct, OrderProductCreationAttributes> implements OrderProduct {
  public id: number;
  public order_id: number;
  public product_id: number;
  public count: number;
  public offer_id: number;
  public subtotal: number;
  public discount: number;
  public total: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof OrderProductModel {
  OrderProductModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      order_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      product_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      count: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      offer_id: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      subtotal: {
        allowNull: true,
        type: DataTypes.FLOAT,
      },
      discount: {
        allowNull: true,
        type: DataTypes.FLOAT,
      },
      total: {
        allowNull: true,
        type: DataTypes.FLOAT,
      },
    },
    {
      tableName: 'order_product',
      sequelize,
    },
  );

  // OrderProductModel.belongsTo(ProductModel, { targetKey: 'id' });
  // OrderProductModel.belongsTo(OrderModel, { targetKey: 'id' });
  // OrderProductModel.belongsTo(OfferModel, { targetKey: 'id' });

  return OrderProductModel;
}
