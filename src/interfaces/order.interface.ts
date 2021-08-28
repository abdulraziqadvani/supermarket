export interface Order {
  id: number;
  user_id: number;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
}
