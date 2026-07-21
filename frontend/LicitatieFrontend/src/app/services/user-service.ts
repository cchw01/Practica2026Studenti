import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserReadDto } from '../Models/user/userDto';
import { AuctionItem } from '../Models/item-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'https://localhost:7137/api/User';

  constructor(private http: HttpClient) { }

  private mapUser(u: any): UserReadDto {
    return {
      ID: u.id,
      UserName: u.userName,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Rating: u.rating,
    };
  }

  getUsers(): Observable<UserReadDto[]> {
    return this.http
      .get<any[]>(this.apiUrl)
      .pipe(map((users) => users.map((u) => this.mapUser(u))));
  }

  getUser(id: number): Observable<UserReadDto> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map((u) => this.mapUser(u)));
  }

  updateUser(id: number, userName: string, name: string): Observable<UserReadDto> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, { userName, name })
      .pipe(map((u) => this.mapUser(u)));
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Operațiuni Wishlist ---
  addToWishlist(userId: number, itemId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/wishlist/${itemId}`, {});
  }

  getWishlist(userId: number): Observable<AuctionItem[]> {
    return this.http.get<AuctionItem[]>(`${this.apiUrl}/${userId}/wishlist`);
  }

  removeFromWishlist(userId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/wishlist/${itemId}`);
  }
}