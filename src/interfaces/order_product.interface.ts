export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  count: number;
  offer_id: number;
  subtotal: number;
  discount: number;
  total: number;
}
