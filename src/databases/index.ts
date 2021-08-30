import config from 'config';
import Sequelize from 'sequelize';
import { dbConfig } from '@interfaces/db.interface';
import OfferModel from '@/models/offer.model';
import CartProductModel from '@/models/cart_product.model';
import CartModel from '@/models/cart.model';
import ProductModel from '@/models/product.model';
import UserModel from '@/models/user.model';
import { logger } from '@utils/logger';

const { pool }: dbConfig = config.get('dbConfig');

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

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
  CartProducts: CartProductModel(sequelize),
  Cart: CartModel(sequelize),
  Products: ProductModel(sequelize),
  Users: UserModel(sequelize),
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};

export default DB;
