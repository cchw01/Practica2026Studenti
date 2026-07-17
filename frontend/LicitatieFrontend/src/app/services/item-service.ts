import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuctionItem } from '../Models/item-model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  // Controllerul se numeste AuctionItemController => ruta este api/AuctionItem
  private readonly apiUrl = 'https://localhost:7137/api/AuctionItem';

  constructor(private http: HttpClient) { }

  getItems(): Observable<AuctionItem[]> {
    return new Observable<AuctionItem[]>(observer => {
      this.http.get<AuctionItem[]>(this.apiUrl).subscribe({
        next: (backendItems) => {
          const localItems = JSON.parse(localStorage.getItem('local_auctions') || '[]');
          observer.next([...localItems, ...backendItems]);
          observer.complete();
        },
        error: () => {
          // Fallback la local items în caz de eroare backend
          const localItems = JSON.parse(localStorage.getItem('local_auctions') || '[]');
          observer.next(localItems);
          observer.complete();
        }
      });
    });
  }

  getItemById(id: number): Observable<AuctionItem> {
    const localItems = JSON.parse(localStorage.getItem('local_auctions') || '[]');
    const localItem = localItems.find((item: any) => item.ID === id);
    if (localItem) {
      return new Observable<AuctionItem>(observer => {
        observer.next(localItem);
        observer.complete();
      });
    }
    return this.http.get<AuctionItem>(`${this.apiUrl}/${id}`);
  }

  createItem(item: AuctionItem): Observable<AuctionItem> {
    return this.http.post<AuctionItem>(this.apiUrl, item);
  }

  // Multipart: campurile itemului + fisierul imagine.
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