import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../services/category-service';
import { Category } from '../Models/categoryItem';

type SortOption = 'endingSoon' | 'priceLowHigh' | 'priceHighLow' | 'newest';

@Component({
  selector: 'app-auctions-page',
  standalone: false,
  templateUrl: './auctions-page.html',
  styleUrls: ['./auctions-page.scss'],
})
export class AuctionsPage implements OnInit {
  loadActiveAuctions(): void {
    this.isLoading = true;
    this.hasError = false;
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items.filter((i) => i.Status !== 'Added' && i.Status !== 'Rejected');
        this.applyFiltersAndSort();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eroare la încărcarea item-urilor', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  allItems: AuctionItem[] = [];
  filteredItems: AuctionItem[] = [];

  categories: string[] = [];
  selectedCategory: string = '';
  searchText: string = '';
  sortBy: SortOption = 'endingSoon';

  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        if (this.allItems.length > 0) {
          this.applyFiltersAndSort();
        }
      }
    });

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items.filter((i) => i.Status !== 'Added' && i.Status !== 'Rejected');
        this.categories = [
          ...new Set(this.allItems.filter((i) => i.Category?.name).map((i) => i.Category.name)),
        ];
        this.applyFiltersAndSort();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eroare la încărcarea item-urilor', err);
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      },
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
    if (diff <= 0) return this.translate.instant('AUCTIONS_PAGE.TIME.ENDED');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
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
