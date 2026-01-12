import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.api.url('/api/orders'));
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(this.api.url(`/api/orders/${id}`));
  }

  create(payload: Order): Observable<Order> {
    return this.http.post<Order>(this.api.url('/api/orders'), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  update(id: number, payload: Order): Observable<Order> {
    return this.http.put<Order>(this.api.url(`/api/orders/${id}`), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/api/orders/${id}`));
  }

  downloadPdf(orderId: number): Observable<Blob> {
    return this.http.get(this.api.url(`/api/orders/${orderId}/pdf`), {
      responseType: 'blob',
    });
  }

  sendEmail(orderId: number): Observable<string> {
    return this.http.post(this.api.url(`/api/orders/${orderId}/email`), null, {
      responseType: 'text' as const,
    });
  }
}
