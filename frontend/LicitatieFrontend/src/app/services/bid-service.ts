import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BidDto {
  id?: number;
  bidderId: number;
  biddedItemId: number;
  price: number;
  date?: string;
}

export interface CreateBidDto {
  bidderId: number;
  biddedItemId: number;
  price: number;
  date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BidService {
  private readonly apiUrl = 'https://localhost:7137/api/Bid';

  constructor(private http: HttpClient) {}

  getBids(): Observable<BidDto[]> {
    return this.http.get<BidDto[]>(this.apiUrl);
  }

  getAllBids(): Observable<BidDto[]> {
    return this.http.get<BidDto[]>(this.apiUrl);
  }

  getBidsByItem(itemId: number): Observable<BidDto[]> {
    return this.http.get<BidDto[]>(`${this.apiUrl}/item/${itemId}`);
  }

  getBidById(id: number): Observable<BidDto> {
    return this.http.get<BidDto>(`${this.apiUrl}/${id}`);
  }

  addBid(bidData: { bidderId: number; biddedItemId: number; price: number }): Observable<BidDto> {
   const payload = {
    AuctionItemId: bidData.biddedItemId,
    Price: bidData.price
  };
    return this.http.post<BidDto>(this.apiUrl, payload);
  }

  deleteBid(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
