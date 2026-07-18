import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuctionItem } from '../Models/item-model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly apiUrl = 'https://localhost:7137/api/AuctionItem';
  private readonly mockUrl = 'assets/mock-items.json';
  private readonly storageKey = 'auctionItems';

  constructor(private http: HttpClient) { }

  getItems(): Observable<AuctionItem[]> {
    return new Observable<AuctionItem[]>(observer => {
      this.http.get<AuctionItem[]>(this.apiUrl).subscribe({
        next: (backendItems) => {
          const saved = localStorage.getItem(this.storageKey);
          const localItems = saved ? JSON.parse(saved) : [];
          observer.next([...localItems, ...backendItems]);
          observer.complete();
        },
        error: () => {
          // Fallback la local storage + mock-items.json
          this.http.get<AuctionItem[]>(this.mockUrl).subscribe({
            next: (mockItems) => {
              const saved = localStorage.getItem(this.storageKey);
              const localItems = saved ? JSON.parse(saved) : [];
              observer.next([...localItems, ...mockItems]);
              observer.complete();
            },
            error: () => {
              const saved = localStorage.getItem(this.storageKey);
              const localItems = saved ? JSON.parse(saved) : [];
              observer.next(localItems);
              observer.complete();
            }
          });
        }
      });
    });
  }

  getItemById(id: number): Observable<AuctionItem> {
    const saved = localStorage.getItem(this.storageKey);
    const localItems = saved ? JSON.parse(saved) : [];
    const localItem = localItems.find((item: any) => item.ID === id);
    if (localItem) {
      return of(localItem);
    }
    return this.http.get<AuctionItem>(`${this.apiUrl}/${id}`);
  }

  createItem(item: AuctionItem): Observable<AuctionItem> {
    return new Observable<AuctionItem>(observer => {
      this.http.post<AuctionItem>(this.apiUrl, item).subscribe({
        next: (res) => {
          observer.next(res);
          observer.complete();
        },
        error: () => {
          const saved = localStorage.getItem(this.storageKey);
          const items: AuctionItem[] = saved ? JSON.parse(saved) : [];
          item.ID = Math.floor(Math.random() * 100000);
          items.push(item);
          localStorage.setItem(this.storageKey, JSON.stringify(items));
          observer.next(item);
          observer.complete();
        }
      });
    });
  }

  // Multipart: campurile itemului + fisierul imagine.
  createItemWithImage(formData: FormData): Observable<AuctionItem> {
    return new Observable<AuctionItem>(observer => {
      this.http.post<AuctionItem>(`${this.apiUrl}/with-image`, formData).subscribe({
        next: (res) => {
          observer.next(res);
          observer.complete();
        },
        error: () => {
          const categoryId = Number(formData.get('CategoryId'));
          const item: any = {
            ID: Math.floor(Math.random() * 100000),
            Name: formData.get('Name'),
            StartPrice: Number(formData.get('StartPrice')),
            CurrentPrice: Number(formData.get('StartPrice')),
            CategoryId: categoryId,
            Category: { id: categoryId, name: 'Mock Category', items: [] },
            Description: formData.get('Description'),
            Location: formData.get('Location'),
            OwnerId: Number(formData.get('OwnerId')),
            Status: 'Active',
            StartDate: new Date().toISOString(),
            EndDate: new Date(Date.now() + Number(formData.get('DurationDays')) * 86400000).toISOString(),
            PhotoList: []
          };

          const saved = localStorage.getItem(this.storageKey);
          const items: AuctionItem[] = saved ? JSON.parse(saved) : [];
          items.push(item);
          localStorage.setItem(this.storageKey, JSON.stringify(items));
          observer.next(item);
          observer.complete();
        }
      });
    });
  }

  updateItem(item: AuctionItem): Observable<AuctionItem> {
    const saved = localStorage.getItem(this.storageKey);
    const items: AuctionItem[] = saved ? JSON.parse(saved) : [];
    const index = items.findIndex(i => i.ID === item.ID);
    if (index !== -1) {
      items[index] = item;
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
    return of(item);
  }

  deleteItem(id: number): Observable<void> {
    const saved = localStorage.getItem(this.storageKey);
    let items: AuctionItem[] = saved ? JSON.parse(saved) : [];
    items = items.filter(i => i.ID !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return of(void 0);
  }
}