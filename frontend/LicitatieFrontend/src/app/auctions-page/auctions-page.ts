import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  getCategoryName(item: AuctionItem): string {
    if (!item || !item.Category) return '';
    return typeof item.Category === 'string' ? item.Category : (item.Category.name || '');
  }

  ngOnInit(): void {
    const searchFromUrl = this.route.snapshot.queryParamMap.get('search');
    if (searchFromUrl) {
      this.searchText = searchFromUrl;
    }

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items || [];
        const catNames = this.allItems.map((i) => this.getCategoryName(i)).filter(Boolean);
        this.categories = Array.from(new Set(catNames));
        this.applyFiltersAndSort();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Eroare la încărcarea item-urilor', err),
    });

    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('search');
      if (q !== null && q !== this.searchText) {
        this.searchText = q;
        this.applyFiltersAndSort();
        this.cdr.detectChanges();
      }
    });
  }

  applyFiltersAndSort(): void {
    let result = [...this.allItems];

    if (this.selectedCategory) {
      result = result.filter((i) => this.getCategoryName(i) === this.selectedCategory);
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      result = result.filter((i) => i.Name && i.Name.toLowerCase().includes(search));
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
    if (diff <= 0) return this.translate.instant('AUCTIONS_PAGE.TIME.ENDED');

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
    this.router.navigate(['/action-item-page', item.ID], { state: { auction: item } });
  }
}
