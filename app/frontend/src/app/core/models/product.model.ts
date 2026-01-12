import { Category } from './category.model';

export interface Product {
  id?: number;
  category: Category; // backend espera un objeto Category
  name: string;
  slug?: string;
  description?: string;
  basePrice?: number; // BigDecimal llega como number en JSON
  active?: boolean;
  createdAt?: string;
}
