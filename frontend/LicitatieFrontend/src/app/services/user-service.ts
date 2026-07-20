import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserReadDto } from '../Models/user/userDto';
import { AuctionItem } from '../Models/item-model';
import { AuctionItemSummaryDto } from '../Models/profile/profile-dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'https://localhost:7137/api/User';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserReadDto[]> {
    return this.http.get<UserReadDto[]>(this.apiUrl);
  }

  getUser(id: number): Observable<UserReadDto> {
    return this.http.get<UserReadDto>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, userName: string, name: string): Observable<UserReadDto> {
    return this.http.put<UserReadDto>(`${this.apiUrl}/${id}`, { userName, name });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Operațiuni Wishlist ---
  addToWishlist(userId: number, itemId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/wishlist/${itemId}`, {});
  }

  getWishlist(userId: number): Observable<AuctionItemSummaryDto[]> {
    return this.http.get<AuctionItemSummaryDto[]>(`${this.apiUrl}/${userId}/wishlist`);
  }

  removeFromWishlist(userId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/wishlist/${itemId}`);
  }
}