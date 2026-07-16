import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../Models/user/categoryItem';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = 'https://localhost:7137/api/Category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}