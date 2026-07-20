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


  private readonly storageKey = 'auction_items_cache';

  private mapResponse(item: any): AuctionItem {
    return {
      ID: item.id,
      Name: item.name,
      StartPrice: item.startPrice,
      CurrentPrice: item.currentPrice,
      Category: { Id: item.categoryId, name: item.categoryName },
      CategoryId: item.categoryId,
      WishingUsers: item.wishingUsers || [],
      Description: item.description,
      Location: item.location,
      Owner: item.owner || { id: item.ownerId, username: item.ownerUserName },
      OwnerId: item.ownerId,
      Winner: item.winner || (item.winnerId ? { id: item.winnerId, username: item.winnerUserName } : undefined),
      WinnerId: item.winnerId,
      Status: item.status,
      StartDate: new Date(item.startDate),
      EndDate: new Date(item.endDate),
      BidList: item.bidList || [],
      PhotoList: item.photoList || [],
      ImageUrl: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : 'https://localhost:7137' + item.imageUrl) : undefined
    } as unknown as AuctionItem;
  }

  constructor(private http: HttpClient) { }

  getItems(): Observable<AuctionItem[]> {
    return this.http
      .get<AuctionItemResponseDto[]>(this.apiUrl)
      .pipe(map((items) => items.map((item) => this.mapResponse(item))));
  }

  getItemById(id: number): Observable<AuctionItem> {
    return this.http
      .get<AuctionItemResponseDto>(`${this.apiUrl}/${id}`)
      .pipe(map((item) => this.mapResponse(item)));
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

    return this.http
      .post<AuctionItemResponseDto>(this.apiUrl, dto)
      .pipe(map((response) => this.mapResponse(response)));
  }

  createItemWithImage(formData: FormData): Observable<AuctionItem> {
    return this.http
      .post<AuctionItemResponseDto>(`${this.apiUrl}/with-image`, formData)
      .pipe(map((response) => this.mapResponse(response)));
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

    return this.http
      .put<AuctionItemResponseDto>(`${this.apiUrl}/${item.ID}`, dto)
      .pipe(map((response) => this.mapResponse(response)));
  }

  deleteItem(id: number): Observable<void> {
    const saved = localStorage.getItem(this.storageKey);
    let items: AuctionItem[] = saved ? JSON.parse(saved) : [];
    items = items.filter((i) => i.ID !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return of(void 0);
  }
}
