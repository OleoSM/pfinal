import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CategoriesPageComponent } from './features/categories/components/categories-page/categories-page.component';
import { ProductsPageComponent } from './features/products/components/products-page/products-page.component';
import { UsersPageComponent } from './features/users/components/users-page/users-page.component';
import { OrdersPageComponent } from './features/orders/components/orders-page/orders-page.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'categories', component: CategoriesPageComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: 'users', component: UsersPageComponent },
  { path: 'orders', component: OrdersPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
