import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { CartProduct } from '@interfaces/cart_product.interface';
// import { ProductModel } from '@models/product.model';
// import { OrderModel } from '@models/order.model';
// import { OfferModel } from '@models/offer.model';

export type CartProductCreationAttributes = Optional<CartProduct, 'id' | 'cart_id' | 'product_id' | 'count' | 'offer_id'>;

export class CartProductModel extends Model<CartProduct, CartProductCreationAttributes> implements CartProduct {
  public id: number;
  public cart_id: number;
  public product_id: number;
  public count: number;
  public offer_id: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CartProductModel {
  CartProductModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      cart_id: {
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
    },
    {
      tableName: 'cart_product',
      sequelize,
    },
  );

  // CartProductModel.belongsTo(ProductModel, { targetKey: 'id' });
  // CartProductModel.belongsTo(OrderModel, { targetKey: 'id' });
  // CartProductModel.belongsTo(OfferModel, { targetKey: 'id' });

  return CartProductModel;
}
