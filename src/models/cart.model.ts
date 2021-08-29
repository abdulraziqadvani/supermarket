import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Cart } from '@/interfaces/cart.interface';
// import { UserModel } from '@models/user.model';

export type CartCreationAttributes = Optional<Cart, 'id' | 'user_id' | 'status' | 'subtotal' | 'discount' | 'total'>;

export class CartModel extends Model<Cart, CartCreationAttributes> implements Cart {
  public id: number;
  public user_id: number;
  public status: string;
  public subtotal: number;
  public discount: number;
  public total: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof CartModel {
  CartModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      status: {
        allowNull: false,
        type: DataTypes.ENUM('DRAFT', 'COMPLETED'),
        defaultValue: 'DRAFT',
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
      tableName: 'cart',
      sequelize,
    },
  );

  // CartModel.belongsTo(UserModel, { targetKey: 'id' });

  return CartModel;
}
