import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats = {
    categories: 0,
    products: 0,
    users: 0,
    orders: 0,
    totalRevenue: 0
  };
  recentProducts: Product[] = [];
  recentOrders: Order[] = [];

  constructor(
    private categoriesService: CategoryService,
    private productsService: ProductService,
    private usersService: UserService,
    private ordersService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      categories: this.categoriesService.getAll(),
      products: this.productsService.getAll(),
      users: this.usersService.getAll(),
      orders: this.ordersService.getAll()
    }).subscribe({
      next: (data) => {
        this.stats = {
          categories: data.categories.length,
          products: data.products.length,
          users: data.users.length,
          orders: data.orders.length,
          totalRevenue: data.orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
        };
        this.recentProducts = data.products.slice(-5).reverse();
        this.recentOrders = data.orders.slice(-5).reverse();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
