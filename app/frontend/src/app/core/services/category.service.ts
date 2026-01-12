import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.api.url('/api/categories'));
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(this.api.url(`/api/categories/${id}`));
  }

  create(payload: Category): Observable<Category> {
    return this.http.post<Category>(this.api.url('/api/categories'), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  update(id: number, payload: Category): Observable<Category> {
    return this.http.put<Category>(this.api.url(`/api/categories/${id}`), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/api/categories/${id}`));
  }
}
