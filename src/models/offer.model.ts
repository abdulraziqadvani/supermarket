import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Offer } from '@interfaces/offer.interface';
// import { ProductModel } from '@models/product.model';

export type OfferCreationAttributes = Optional<Offer, 'id' | 'key' | 'product_id'>;

export class OfferModel extends Model<Offer, OfferCreationAttributes> implements Offer {
  public id: number;
  public key: string;
  public product_id: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof OfferModel {
  OfferModel.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      key: {
        allowNull: false,
        type: DataTypes.ENUM('BUY_2_GET_1_FREE', 'BUY_1_GET_HALF_OFF'),
      },
      product_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'offer',
      sequelize,
    },
  );

  // OfferModel.belongsTo(ProductModel, { targetKey: 'id' });

  return OfferModel;
}
