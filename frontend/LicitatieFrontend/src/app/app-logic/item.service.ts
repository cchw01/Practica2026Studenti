import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuctionItem } from '../Models/item/item-model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  //enpoint backend
  private baseUrl = '/api/item';

  constructor(private http: HttpClient) {}

  getItems(): Observable<AuctionItem[]> {
    return this.http.get<AuctionItem[]>(this.baseUrl);
  }
}