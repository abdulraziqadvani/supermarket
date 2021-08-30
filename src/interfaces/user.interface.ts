import { Cart } from './cart.interface';

export interface User {
  id: number;
  email: string;
  password: string;
}

export interface UserDetailed {
  id: number;
  email: string;
  password: string;
  cart?: Cart;
}
