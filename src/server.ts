process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import ProductsRoute from '@routes/products.route';
import CartRoute from '@/routes/cart.route';
import OffersRoute from '@/routes/offers.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new ProductsRoute(), new CartRoute(), new OffersRoute()]);

app.listen();
