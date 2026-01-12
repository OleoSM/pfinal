import { OrderItem } from './order-item.model';

export interface Order {
  id?: number;
  userId: number;
  status: string;
  grandTotal: number;
  shippingAddressId?: number | null;
  createdAt?: string;
  items: OrderItem[];
}
