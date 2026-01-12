import { Routes } from '@angular/router';
import { ShellComponent } from './shared/components/shell/shell.component';

export const routes: Routes = [
  // Login redirige al dashboard (usuario admin siempre logueado)
  {
    path: 'login',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
      },
      { 
        path: 'products', 
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
      },
      { 
        path: 'users', 
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      { 
        path: 'orders', 
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
