import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Product } from '@interfaces/product.interface';
// import { OfferModel } from '@models/offer.model';

export type ProductCreationAttributes = Optional<Product, 'id' | 'name' | 'price' | 'available'>;

export class ProductModel extends Model<Product, ProductCreationAttributes> implements Product {
  public id: number;
  public name: string;
  public price: number;
  public available: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ProductModel {
  ProductModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      price: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      available: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'product',
      sequelize,
    },
  );

  // ProductModel.hasMany(OfferModel, { foreignKey: 'product_id' });

  return ProductModel;
}
