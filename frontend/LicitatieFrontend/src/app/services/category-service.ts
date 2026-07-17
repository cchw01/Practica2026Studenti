import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../Models/user/categoryItem';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = 'assets/categories.json';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}