import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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

  constructor(private http: HttpClient) { }

  getItems(): Observable<AuctionItem[]> {
    return this.http
      .get<AuctionItemResponseDto[]>(this.apiUrl)
      .pipe(map(items => items.map(item => this.mapResponse(item))));
  }

  getItemById(id: number): Observable<AuctionItem> {
    return this.http
      .get<AuctionItemResponseDto>(`${this.apiUrl}/${id}`)
      .pipe(map(item => this.mapResponse(item)));
  }

  createItem(item: AuctionItem): Observable<AuctionItem> {
    const dto: CreateAuctionItemDto = {
      name: item.Name,
      startPrice: item.StartPrice,
      categoryId: item.CategoryId,
      description: item.Description,
      location: item.Location,
      startDate: new Date(item.StartDate).toISOString(),
      endDate: new Date(item.EndDate).toISOString()
    };

    return this.http
      .post<AuctionItemResponseDto>(this.apiUrl, dto)
      .pipe(map(response => this.mapResponse(response)));
  }

  createItemWithImage(formData: FormData): Observable<AuctionItem> {
    const startDate = new Date();
    const durationDays = Number(formData.get('DurationDays'));

    const dto: CreateAuctionItemDto = {
      name: String(formData.get('Name') ?? ''),
      startPrice: Number(formData.get('StartPrice')),
      categoryId: Number(formData.get('CategoryId')),
      description: String(formData.get('Description') ?? ''),
      location: String(formData.get('Location') ?? ''),
      startDate: startDate.toISOString(),
      endDate: new Date(
        startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
      ).toISOString()
    };

    return this.http
      .post<AuctionItemResponseDto>(this.apiUrl, dto)
      .pipe(map(response => this.mapResponse(response)));
  }

  updateItem(item: AuctionItem): Observable<AuctionItem> {
    const dto: UpdateAuctionItemDto = {
      name: item.Name,
      startPrice: item.StartPrice,
      categoryId: item.CategoryId,
      description: item.Description,
      location: item.Location,
      startDate: new Date(item.StartDate).toISOString(),
      endDate: new Date(item.EndDate).toISOString()
    };

    return this.http
      .put<AuctionItemResponseDto>(
        `${this.apiUrl}/${item.ID}`,
        dto
      )
      .pipe(map(response => this.mapResponse(response)));
  }

  deleteItem(id: number): Observable<void> {
    const saved = localStorage.getItem(this.storageKey);
    let items: AuctionItem[] = saved ? JSON.parse(saved) : [];
    items = items.filter(i => i.ID !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return of(void 0);
  }

  private mapResponse(item: AuctionItemResponseDto): AuctionItem {
    return {
      ID: item.id,
      Name: item.name,
      StartPrice: item.startPrice,
      CurrentPrice: item.currentPrice,
      Category: {
        id: item.categoryId,
        name: item.categoryName,
        items: []
      } as any,
      CategoryId: item.categoryId,
      WishingUsers: [],
      Description: item.description,
      Location: item.location,
      Owner: {
        ID: item.ownerId,
        UserName: item.ownerUserName
      } as any,
      OwnerId: item.ownerId,
      Winner: item.winnerId
        ? {
            ID: item.winnerId,
            UserName: item.winnerUserName ?? ''
          } as any
        : undefined,
      WinnerId: item.winnerId,
      Status: item.status,
      StartDate: new Date(item.startDate),
      EndDate: new Date(item.endDate),
      BidList: []
    };
  }
}