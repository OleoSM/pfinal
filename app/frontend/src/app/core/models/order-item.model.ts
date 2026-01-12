export interface OrderItem {
  id?: number;
  productId?: number;
  productVariantId?: number;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}
