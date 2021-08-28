import config from 'config';
import Sequelize from 'sequelize';
import { dbConfig } from '@interfaces/db.interface';
import OfferModel from '@/models/offer.model';
import OrderProductModel from '@/models/order_product.model';
import OrderModel from '@/models/order.model';
import ProductModel from '@/models/product.model';
import UserModel from '@/models/user.model';
import { logger } from '@utils/logger';

const { host, user, password, database, pool }: dbConfig = config.get('dbConfig');
const sequelize = new Sequelize.Sequelize(database, user, password, {
  host: host,
  dialect: 'postgres',
  timezone: '+05:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: pool.min,
    max: pool.max,
  },
  logQueryParameters: process.env.NODE_ENV === 'development',
  logging: (query, time) => {
    logger.info(time + 'ms' + ' ' + query);
  },
  benchmark: true,
  query: { raw: true },
});

sequelize.authenticate();

const DB = {
  Offers: OfferModel(sequelize),
  OrderProducts: OrderProductModel(sequelize),
  Orders: OrderModel(sequelize),
  products: ProductModel(sequelize),
  Users: UserModel(sequelize),
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};

export default DB;
