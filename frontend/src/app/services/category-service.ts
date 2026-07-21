import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category, CategoryCreate } from '../Models/categoryItem';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = 'https://localhost:7137/api/Category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(cats => cats.map(c => ({ Id: c.id, name: c.name } as Category)))
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  addCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(category: Category): Observable<any> {
    return this.http.put(this.apiUrl, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
