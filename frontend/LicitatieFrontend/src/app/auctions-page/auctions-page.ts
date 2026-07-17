import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';
import { CategoryService } from '../services/category-service';
import { Category } from '../Models/categoryItem';

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

  constructor(
    private itemService: ItemService,
    private categoryService: CategoryService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        if (this.allItems.length > 0) {
          this.applyFiltersAndSort();
        }
      }
    });

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.applyFiltersAndSort();
      },
      error: (err) => console.error('Eroare la încărcarea item-urilor', err),
    });

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.map((c) => c.name);
      },
      error: (err) => console.error('Eroare la încărcarea categoriilor', err),
    });
  }
  applyFiltersAndSort(): void {
    let result = [...this.allItems];

    if (this.selectedCategory) {
      result = result.filter((i) => i.Category?.name === this.selectedCategory);
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter((i) => i.Name.toLowerCase().includes(search));
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
}
