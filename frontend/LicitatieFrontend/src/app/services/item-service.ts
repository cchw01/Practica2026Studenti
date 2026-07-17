import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuctionItem } from '../Models/item-model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly mockUrl = 'assets/mock-items.json';
  private readonly storageKey = 'auctionItems';

  constructor(private http: HttpClient) { }

  getItems(): Observable<AuctionItem[]> {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return of(JSON.parse(saved));
    }
    return this.http.get<AuctionItem[]>(this.mockUrl).pipe(
      tap(items => localStorage.setItem(this.storageKey, JSON.stringify(items)))
    );
  }

  getItemById(id: number): Observable<AuctionItem> {
    return this.getItems().pipe(
      map(items => items.find(i => i.ID === id) as AuctionItem)
    );
  }

  createItem(item: AuctionItem): Observable<AuctionItem> {
    const saved = localStorage.getItem(this.storageKey);
    const items: AuctionItem[] = saved ? JSON.parse(saved) : [];
    item.ID = Math.floor(Math.random() * 100000);
    items.push(item);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return of(item);
  }

  createItemWithImage(formData: FormData): Observable<AuctionItem> {
    // Reconstruct item from formData for the mock implementation
    const categoryId = Number(formData.get('CategoryId'));
    const item: any = {
      ID: Math.floor(Math.random() * 100000),
      Name: formData.get('Name'),
      StartPrice: Number(formData.get('StartPrice')),
      CurrentPrice: Number(formData.get('StartPrice')),
      CategoryId: categoryId,
      Category: { id: categoryId, name: 'Mock Category', items: [] }, // We mock the category name here
      Description: formData.get('Description'),
      Location: formData.get('Location'),
      OwnerId: Number(formData.get('OwnerId')),
      Status: 0,
      StartDate: new Date().toISOString(),
      EndDate: new Date(Date.now() + Number(formData.get('DurationDays')) * 86400000).toISOString(),
      ImageUrl: 'assets/images/placeholder.png' // Mock image URL
    };

    const saved = localStorage.getItem(this.storageKey);
    const items: AuctionItem[] = saved ? JSON.parse(saved) : [];
    items.push(item);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    
    return of(item);
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