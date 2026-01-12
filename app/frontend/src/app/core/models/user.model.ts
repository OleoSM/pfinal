export type UserRole = 'admin' | 'customer' | 'staff' | string;

export interface User {
  id?: number;
  name: string;
  email: string;
  passwordHash?: string; // el backend guarda passwordHash
  role: UserRole;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}
