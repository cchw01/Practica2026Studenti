import { Component, OnInit } from '@angular/core';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';

type SortOption = 'endingSoon' | 'priceLowHigh' | 'priceHighLow' | 'newest';

@Component({
  selector: 'app-auctions-page',
  standalone: false,
  templateUrl: './auctions-page.html',
  styleUrls: ['./auctions-page.css'],
})
export class AuctionsPage implements OnInit {
  allItems: AuctionItem[] = [];
  filteredItems: AuctionItem[] = [];

  categories: string[] = [];
  selectedCategory: string = '';
  searchText: string = '';
  sortBy: SortOption = 'endingSoon';

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.categories = [...new Set(items.map((i) => i.category))];
        this.applyFiltersAndSort();
      },
      error: (err) => console.error('Error loading items', err),
    });
  }

  applyFiltersAndSort(): void {
    let result = [...this.allItems];

    if (this.selectedCategory) {
      result = result.filter((i) => i.category === this.selectedCategory);
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(search));
    }

    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'priceLowHigh':
          return a.currentPrice - b.currentPrice;
        case 'priceHighLow':
          return b.currentPrice - a.currentPrice;
        case 'newest':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'endingSoon':
        default:
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
    });

    this.filteredItems = result;
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  getRemainingTime(endDate: Date): string {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  }

  getTimeUrgencyClass(endDate: Date): string {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    const hoursLeft = diff / (1000 * 60 * 60);

    if (hoursLeft <= 24) return 'time-urgent';
    if (hoursLeft <= 72) return 'time-medium';
    return 'time-safe';
  }
}
