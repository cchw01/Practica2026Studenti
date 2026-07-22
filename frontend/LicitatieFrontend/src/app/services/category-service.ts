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
      map((categories) => categories.map((category) => this.mapCategory(category)))
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`).pipe(map((category) => this.mapCategory(category)));
  }

  addCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(map((createdCategory) => this.mapCategory(createdCategory)));
  }

  updateCategory(category: Category): Observable<any> {
    return this.http.put(this.apiUrl, {
      Id: category.Id, Name: category.name, Description: category.description,
    }).pipe(map((category) => this.mapCategory(category)));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapCategory(category: any): Category {
    return new Category({
      Id: category.id ?? category.Id,
      name: category.name ?? category.Name ?? '',
      description: category.description ?? category.Description ?? '',
    });
  }
}
