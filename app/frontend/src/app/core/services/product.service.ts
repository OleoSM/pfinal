import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.api.url('/api/products'));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(this.api.url(`/api/products/${id}`));
  }

  create(payload: Product): Observable<Product> {
    return this.http.post<Product>(this.api.url('/api/products'), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  update(id: number, payload: Product): Observable<Product> {
    return this.http.put<Product>(this.api.url(`/api/products/${id}`), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/api/products/${id}`));
  }
}
