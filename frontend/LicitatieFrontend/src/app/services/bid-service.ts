import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BidDto, CreateBidDto } from '../Models/bid/bid'; 

@Injectable({
  providedIn: 'root'
})
export class BidService {
  
  private readonly apiUrl = 'https://localhost:7137/api/Bid';
  constructor(private http: HttpClient) { }

  getAllBids(): Observable<BidDto[]> {
    return this.http.get<BidDto[]>(this.apiUrl);
  }

 
  getBidsByItem(itemId: number): Observable<BidDto[]> {
    return this.http.get<BidDto[]>(`${this.apiUrl}/item/${itemId}`);
  }


  getBidById(id: number): Observable<BidDto> {
    return this.http.get<BidDto>(`${this.apiUrl}/${id}`);
  }

 
  addBid(bidData: CreateBidDto): Observable<BidDto> {
    return this.http.post<BidDto>(this.apiUrl, bidData);
  }

  
  deleteBid(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}