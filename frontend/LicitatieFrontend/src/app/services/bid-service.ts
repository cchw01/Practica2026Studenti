import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid } from '../Models/bid/bid'; 



@Injectable({
  providedIn: 'root',
})
export class BidService {
  
  private readonly apiUrl = 'http://localhost:5000/api/Bid';

  constructor(private http: HttpClient) {}

  getBids(): Observable<Bid[]> {
    return this.http.get<Bid[]>(this.apiUrl);
  }

  getBidById(id: number): Observable<Bid> {
    return this.http.get<Bid>(`${this.apiUrl}/${id}`);
  }

  createBid(bid: Bid): Observable<Bid> {
    return this.http.post<Bid>(this.apiUrl, bid);
  }

  updateBid(bid: Bid): Observable<Bid> {
    return this.http.put<Bid>(this.apiUrl, bid);
  }

  deleteBid(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}