import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AuctionItem } from '../Models/item-model';

interface CreateAuctionItemDto {
  name: string;
  startPrice: number;
  categoryId: number;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface UpdateAuctionItemDto {
  name: string;
  startPrice: number;
  categoryId: number;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface AuctionItemResponseDto {
  id: number;
  name: string;
  startPrice: number;
  currentPrice: number;
  categoryId: number;
  categoryName: string;
  description?: string;
  location: string;
  ownerId: number;
  ownerUserName: string;
  winnerId?: number;
  winnerUserName?: string;
  status: AuctionItem['Status'];
  startDate: string;
  endDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private readonly apiUrl = 'https://localhost:7137/api/AuctionItem';
  private readonly mockUrl = 'assets/mock-items.json';
  private readonly storageKey = 'auctionItems';

  constructor(private http: HttpClient) { }

  public formatImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `https://localhost:7137${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private mapResponse(item: any): AuctionItem {
    const rawUrl = item.imageUrl || item.ImageUrl || '';
    let parsedPhotoList: string[] = [];
    if (rawUrl.includes('|||')) {
      parsedPhotoList = rawUrl.split('|||').map((u: string) => u.trim()).filter(Boolean);
    } else if (item.photoList && Array.isArray(item.photoList) && item.photoList.length > 0) {
      parsedPhotoList = item.photoList;
    } else if (item.PhotoList && Array.isArray(item.PhotoList) && item.PhotoList.length > 0) {
      parsedPhotoList = item.PhotoList;
    } else if (rawUrl) {
      parsedPhotoList = [rawUrl];
    }

    parsedPhotoList = parsedPhotoList.map(u => this.formatImageUrl(u));
    const mainImageUrl = parsedPhotoList.length > 0 ? parsedPhotoList[0] : undefined;

    return this.sanitizeItem({
      ID: item.id || item.ID,
      Name: item.name || item.Name,
      StartPrice: item.startPrice ?? item.StartPrice,
      CurrentPrice: item.currentPrice ?? item.CurrentPrice ?? item.startPrice ?? item.StartPrice,
      Category: { id: item.categoryId || item.CategoryId, name: item.categoryName || (item.Category?.name) },
      CategoryId: item.categoryId || item.CategoryId,
      WishingUsers: item.wishingUsers || [],
      Description: item.description || item.Description,
      Location: item.location || item.Location,
      Owner: item.owner || { id: item.ownerId || item.OwnerId, username: item.ownerUserName || item.OwnerUserName },
      OwnerId: item.ownerId || item.OwnerId,
      Winner: item.winner || (item.winnerId ? { id: item.winnerId, username: item.winnerUserName } : undefined),
      WinnerId: item.winnerId || item.WinnerId,
      Status: item.status || item.Status,
      StartDate: new Date(item.startDate || item.StartDate),
      EndDate: new Date(item.endDate || item.EndDate),
      BidList: item.bidList || item.BidList || [],
      PhotoList: parsedPhotoList,
      ImageUrl: mainImageUrl
    });
  }

  private sanitizeItem(item: any): AuctionItem {
    if (!item) return item;

    const categoryMap: { [key: number]: string } = {
      1: 'Vehicles',
      2: 'Electronics',
      3: 'Art',
      4: 'Clothing',
      5: 'Home & Garden',
      6: 'Real Estate'
    };

    let catId = item.CategoryId || (item.Category && item.Category.id) || 1;
    let catName = (item.Category && typeof item.Category === 'object' && item.Category.name)
      ? item.Category.name
      : (typeof item.Category === 'string' ? item.Category : (categoryMap[catId] || 'Vehicles'));

    item.CategoryId = catId;
    item.Category = { id: catId, name: catName, items: [] };

    const galleryMap: { [key: string]: string[] } = {
      'Vehicles': [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop'
      ],
      'Art': [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop'
      ],
      'Clothing': [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop'
      ],
      'Electronics': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop'
      ],
      'Real Estate': [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop'
      ]
    };

    if (item.Name && item.Name.toLowerCase().includes('watch')) {
      item.ImageUrl = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop';
      item.PhotoList = galleryMap['Art'];
    }

    const defaultGallery = galleryMap[catName] || galleryMap['Vehicles'];

    if (!item.PhotoList || !Array.isArray(item.PhotoList) || item.PhotoList.length === 0) {
      if (item.ImageUrl) {
        const mainImg = (item.ImageUrl.startsWith('http') || item.ImageUrl.startsWith('data:')) ? item.ImageUrl : `https://localhost:7137${item.ImageUrl}`;
        item.PhotoList = [mainImg];
      }
    }

    if (!item.ImageUrl && item.PhotoList && item.PhotoList.length > 0) {
      item.ImageUrl = item.PhotoList[0];
    }

    return item;
  }

  private getLocalItems(): AuctionItem[] {
    const saved1 = localStorage.getItem(this.storageKey);
    const items1: AuctionItem[] = saved1 ? JSON.parse(saved1) : [];
    const saved2 = localStorage.getItem('local_auctions');
    const items2: AuctionItem[] = saved2 ? JSON.parse(saved2) : [];
    const combined = [...items2, ...items1];
    const map = new Map<number, AuctionItem>();
    for (const item of combined) {
      if (item && item.ID) {
        map.set(item.ID, this.sanitizeItem(item));
      }
    }
    return Array.from(map.values());
  }

  getItems(): Observable<AuctionItem[]> {
    return new Observable<AuctionItem[]>(observer => {
      this.http.get<AuctionItem[]>(this.apiUrl).subscribe({
        next: (backendItems) => {
          const sanitizedBackend = (backendItems || []).map(i => this.mapResponse(i));
          const localItems = this.getLocalItems();
          const map = new Map<number, AuctionItem>();
          for (const l of localItems) map.set(l.ID, l);
          for (const s of sanitizedBackend) map.set(s.ID, s);
          observer.next(Array.from(map.values()));
          observer.complete();
        },
        error: () => {
          this.http.get<AuctionItem[]>(this.mockUrl).subscribe({
            next: (mockItems) => {
              const sanitizedMock = (mockItems || []).map(i => this.sanitizeItem(i));
              const localItems = this.getLocalItems();
              const map = new Map<number, AuctionItem>();
              for (const m of sanitizedMock) map.set(m.ID, m);
              for (const l of localItems) map.set(l.ID, l);
              observer.next(Array.from(map.values()));
              observer.complete();
            },
            error: () => {
              const localItems = this.getLocalItems();
              observer.next(localItems);
              observer.complete();
            }
          });
        }
      });
    });
  }

  getActiveItems(): Observable<AuctionItem[]> {
    return this.http
      .get<AuctionItemResponseDto[]>(`${this.apiUrl}/active`)
      .pipe(map((items) => items.map((item) => this.mapResponse(item))));
  }

  getItemById(id: number): Observable<AuctionItem> {
    return new Observable<AuctionItem>(observer => {
      this.http.get<AuctionItem>(`${this.apiUrl}/${id}`).subscribe({
        next: (res) => {
          observer.next(this.mapResponse(res));
          observer.complete();
        },
        error: (err) => {
          const localItems = this.getLocalItems();
          const localItem = localItems.find((item: any) => item.ID === id);
          if (localItem) {
            observer.next(this.sanitizeItem(localItem));
            observer.complete();
          } else {
            this.http.get<AuctionItem[]>(this.mockUrl).subscribe({
              next: (mockItems) => {
                const found = mockItems.find(i => i.ID === id) || mockItems[0];
                observer.next(this.sanitizeItem(found));
                observer.complete();
              },
              error: () => observer.error(err)
            });
          }
        }
      });
    });
  }

  createItem(item: AuctionItem): Observable<AuctionItem> {
    const dto: CreateAuctionItemDto = {
      name: item.Name,
      startPrice: item.StartPrice,
      categoryId: item.CategoryId,
      description: item.Description,
      location: item.Location,
      startDate: new Date(item.StartDate).toISOString(),
      endDate: new Date(item.EndDate).toISOString(),
    };

    return new Observable<AuctionItem>(observer => {
      this.http.post<AuctionItemResponseDto>(this.apiUrl, dto).subscribe({
        next: (res) => {
          observer.next(this.mapResponse(res));
          observer.complete();
        },
        error: () => {
          const items: AuctionItem[] = this.getLocalItems();
          item.ID = Math.floor(Math.random() * 100000);
          const sanitized = this.sanitizeItem(item);
          items.push(sanitized);
          localStorage.setItem(this.storageKey, JSON.stringify(items));
          localStorage.setItem('local_auctions', JSON.stringify(items));
          observer.next(sanitized);
          observer.complete();
        }
      });
    });
  }

  createItemWithImage(formData: FormData): Observable<AuctionItem> {
    return new Observable<AuctionItem>(observer => {
      this.http.post<AuctionItemResponseDto>(`${this.apiUrl}/with-image`, formData).subscribe({
        next: (res) => {
          observer.next(this.mapResponse(res));
          observer.complete();
        },
        error: () => {
          const categoryId = Number(formData.get('CategoryId'));
          const categoryNames: { [key: number]: string } = {
            1: 'Vehicles',
            2: 'Electronics',
            3: 'Art',
            4: 'Clothing',
            5: 'Home & Garden',
            6: 'Real Estate'
          };
          const catName = categoryNames[categoryId] || 'Other';
          const item: any = {
            ID: Math.floor(Math.random() * 100000),
            Name: formData.get('Name'),
            StartPrice: Number(formData.get('StartPrice')),
            CurrentPrice: Number(formData.get('StartPrice')),
            CategoryId: categoryId,
            Category: { id: categoryId, name: catName, items: [] },
            Description: formData.get('Description'),
            Location: formData.get('Location'),
            OwnerId: Number(formData.get('OwnerId')),
            Status: 'Active',
            StartDate: new Date().toISOString(),
            EndDate: new Date(Date.now() + Number(formData.get('DurationDays')) * 86400000).toISOString(),
            PhotoList: []
          };

          const sanitized = this.sanitizeItem(item);
          const items: AuctionItem[] = this.getLocalItems();
          items.push(sanitized);
          localStorage.setItem(this.storageKey, JSON.stringify(items));
          localStorage.setItem('local_auctions', JSON.stringify(items));
          observer.next(sanitized);
          observer.complete();
        }
      });
    });
  }

  updateItem(item: AuctionItem): Observable<AuctionItem> {
    const dto: UpdateAuctionItemDto = {
      name: item.Name,
      startPrice: item.StartPrice,
      categoryId: item.CategoryId,
      description: item.Description,
      location: item.Location,
      startDate: new Date(item.StartDate).toISOString(),
      endDate: new Date(item.EndDate).toISOString(),
    };

    return new Observable<AuctionItem>(observer => {
      this.http.put<AuctionItemResponseDto>(`${this.apiUrl}/${item.ID}`, dto).subscribe({
        next: (res) => {
          observer.next(this.mapResponse(res));
          observer.complete();
        },
        error: () => {
          const items: AuctionItem[] = this.getLocalItems();
          const index = items.findIndex(i => i.ID === item.ID);
          if (index !== -1) {
            items[index] = this.sanitizeItem(item);
            localStorage.setItem(this.storageKey, JSON.stringify(items));
            localStorage.setItem('local_auctions', JSON.stringify(items));
          }
          observer.next(this.sanitizeItem(item));
          observer.complete();
        }
      });
    });
  }

  deleteItem(id: number): Observable<void> {
    let items: AuctionItem[] = this.getLocalItems();
    items = items.filter(i => i.ID !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    localStorage.setItem('local_auctions', JSON.stringify(items));
    return of(void 0);
  }
}
