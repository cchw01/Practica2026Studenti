import { Component } from '@angular/core';
import { AuctionItem } from '../Models/item-model';
import { StatusEnum } from '../Models/status-enum';

@Component({
  selector: 'app-auction-item-page',
  standalone: false,
  templateUrl: './auction-item-page.html',
  styleUrl: './auction-item-page.css',
})
export class AuctionItemPage {
  auctionItem: AuctionItem = {
    id: 1,
    name: 'Auction item',
    startPrice: 100,
    currentPrice: 180,
    category: 'Electronics',
    description: 'A premium item with excellent condition and fast shipping.',
    location: 'Bucharest',
    owner: 'Alex Popescu',
    status: 'Active',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-20'),
  };

  bidAmount = this.auctionItem.currentPrice + 10;

  placeBid(): void {
    if (this.bidAmount > this.auctionItem.currentPrice) {
      this.auctionItem.currentPrice = this.bidAmount;
      this.bidAmount = this.auctionItem.currentPrice + 10;
    }
  }
}
