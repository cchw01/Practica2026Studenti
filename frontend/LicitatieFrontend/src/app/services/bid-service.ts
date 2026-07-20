import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bid } from '../Models/bid/bid';

@Injectable({
  providedIn: 'root',
})
export class BidService {
  private readonly apiUrl = 'https://localhost:7137/api/Bid';

  constructor(private http: HttpClient) {}

  getBids(): Observable<Bid[]> {
    return this.http.get<Bid[]>(this.apiUrl);
  }

  getBidsByItem(itemId: number): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/item/${itemId}`);
  }

  addBid(bid: { bidderId: number; biddedItemId: number; price: number }): Observable<Bid> {
    const payload = {
      BidderId: bid.bidderId,
      BiddedItemId: bid.biddedItemId,
      price: bid.price,
      date: new Date().toISOString(),
    };
    return this.http.post<Bid>(this.apiUrl, payload);
  }
}
