import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuctionItem } from '../Models/item-model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  // Controllerul se numeste AuctionItemController => ruta este api/AuctionItem
  // (valoarea veche http://localhost:5000/api/items nu exista in backend)
  private readonly apiUrl = 'https://localhost:7137/api/AuctionItem';

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

  // Multipart: campurile itemului + fisierul imagine.
  // NU seta Content-Type manual - browserul adauga singur boundary-ul multipart.
  createItemWithImage(formData: FormData): Observable<AuctionItem> {
    return this.http.post<AuctionItem>(`${this.apiUrl}/with-image`, formData);
  }

  updateItem(item: AuctionItem): Observable<AuctionItem> {
    return this.http.put<AuctionItem>(this.apiUrl, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}