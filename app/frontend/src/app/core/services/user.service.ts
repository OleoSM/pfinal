import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.api.url('/api/users'));
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(this.api.url(`/api/users/${id}`));
  }

  create(payload: User): Observable<User> {
    return this.http.post<User>(this.api.url('/api/users'), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  update(id: number, payload: User): Observable<User> {
    return this.http.put<User>(this.api.url(`/api/users/${id}`), payload, {
      headers: this.api.jsonHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.api.url(`/api/users/${id}`));
  }
}
