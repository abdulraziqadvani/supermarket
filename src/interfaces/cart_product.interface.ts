export interface CartProduct {
  id: number;
  cart_id: number;
  product_id: number;
  count: number;
  offer_id: number;
}

export interface createCartProduct {
  product_id: number;
  count: number;
}
