import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Order } from '@interfaces/order.interface';
// import { UserModel } from '@models/user.model';

export type OrderCreationAttributes = Optional<Order, 'id' | 'user_id' | 'status' | 'subtotal' | 'discount' | 'total'>;

export class OrderModel extends Model<Order, OrderCreationAttributes> implements Order {
  public id: number;
  public user_id: number;
  public status: string;
  public subtotal: number;
  public discount: number;
  public total: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof OrderModel {
  OrderModel.init(
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
      tableName: 'order',
      sequelize,
    },
  );

  // OrderModel.belongsTo(UserModel, { targetKey: 'id' });

  return OrderModel;
}
