import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';
import { Router } from '@angular/router';

type SortOption = 'endingSoon' | 'priceLowHigh' | 'priceHighLow' | 'newest';

@Component({
  selector: 'app-auctions-page',
  standalone: false,
  templateUrl: './auctions-page.html',
  styleUrls: ['./auctions-page.scss'],
})
export class AuctionsPage implements OnInit {
  allItems: AuctionItem[] = [];
  filteredItems: AuctionItem[] = [];

  categories: string[] = [];
  selectedCategory: string = '';
  searchText: string = '';
  sortBy: SortOption = 'endingSoon';

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const searchFromUrl = this.route.snapshot.queryParamMap.get('search');
    if (searchFromUrl) {
      this.searchText = searchFromUrl;
    }

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.categories = [...new Set(items.map(i => i.Category.name))];
        this.applyFiltersAndSort();
      },
      error: (err) => console.error('Eroare la încărcarea item-urilor', err)
    });
  }

  applyFiltersAndSort(): void {
    let result = [...this.allItems];

    if (this.selectedCategory) {
      result = result.filter(i => i.Category?.name === this.selectedCategory);
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter(i => i.Name.toLowerCase().includes(search));
    }

    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'priceLowHigh':
          return a.CurrentPrice - b.CurrentPrice;
        case 'priceHighLow':
          return b.CurrentPrice - a.CurrentPrice;
        case 'newest':
          return new Date(b.StartDate).getTime() - new Date(a.StartDate).getTime();
        case 'endingSoon':
        default:
          return new Date(a.EndDate).getTime() - new Date(b.EndDate).getTime();
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

  goToAuctionDetail(item: AuctionItem): void {
    this.router.navigate(['/action-item-page'], { state: { auction: item } });
  }
}
