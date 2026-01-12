import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { ShellComponent } from './shared/components/shell/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CategoriesPageComponent } from './features/categories/components/categories-page/categories-page.component';
import { ProductsPageComponent } from './features/products/components/products-page/products-page.component';
import { UsersPageComponent } from './features/users/components/users-page/users-page.component';
import { OrdersPageComponent } from './features/orders/components/orders-page/orders-page.component';

@NgModule({
  declarations: [
    AppComponent,
    ShellComponent,
    DashboardComponent,
    CategoriesPageComponent,
    ProductsPageComponent,
    UsersPageComponent,
    OrdersPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
