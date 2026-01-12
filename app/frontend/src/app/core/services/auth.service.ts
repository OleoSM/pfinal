import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Usuario admin simulado - siempre logueado
  private readonly adminUser: AuthUser = {
    id: 1,
    name: 'Administrador',
    email: 'admin@gymwear.com',
    role: 'admin'
  };

  private currentUserSubject = new BehaviorSubject<AuthUser>(this.adminUser);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  // Siempre retorna true - usuario siempre autenticado
  isAuthenticated(): boolean {
    return true;
  }

  getCurrentUser(): AuthUser {
    return this.adminUser;
  }

  hasRole(role: string): boolean {
    return this.adminUser.role === role;
  }

  isAdmin(): boolean {
    return true;
  }

  // Logout deshabilitado - solo muestra mensaje
  logout(): void {
    console.log('Sistema en modo administrador - logout deshabilitado');
  }
}
