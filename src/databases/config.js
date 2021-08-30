require('dotenv').config();

module.exports = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: 5432,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false,
  migrationStorageTableName: 'sequelize_meta',
  seederStorageTableName: 'sequelize_data',
  define: {
    underscored: true,
  },
};
