import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuctionItem } from '../Models/item-model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly apiUrl = 'http://localhost:5153/api/AuctionItem';

  constructor(private http: HttpClient) { }

  getItems(): Observable<AuctionItem[]> {
    return this.http.get<AuctionItem[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<AuctionItem> {
    return this.http.get<AuctionItem>(`${this.apiUrl}/${id}`);
  }

  createItem(item: AuctionItem): Observable<AuctionItem> {
    return this.http.post<AuctionItem>(this.apiUrl, item);
  }

  updateItem(item: AuctionItem): Observable<AuctionItem> {
    return this.http.put<AuctionItem>(this.apiUrl, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
