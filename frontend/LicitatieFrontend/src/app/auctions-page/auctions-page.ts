import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';
import { CategoryService } from '../services/category-service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../services/user-service';
import { AuthService } from '../services/auth';

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

  isLoading: boolean = true;
  hasError: boolean = false;
  currentUserId: number = 0;

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private categoryService: CategoryService,
    public authService: AuthService,
    private userService: UserService,
  ) {}

  getCategoryName(item: AuctionItem): string {
    const category = (item?.Category ?? (item as any)?.category) as string | { name?: string; Name?: string } | undefined;

    if (!category) { return ''; }

    if (typeof category === 'string') {
      return category.trim();
    }

    return String(category.name ?? category.Name ?? '').trim();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['search']) {
        this.searchText = params['search'];
      }
      this.applyFiltersAndSort();
    });

    const authUserId = this.authService.getCurrentUserId();
    this.currentUserId = authUserId !== null ? authUserId : 0;

    this.loadActiveAuctions();

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = (categories || [])
          .map((category) =>
            String(category.name ?? (category as any).Name ?? '').trim(),
          )
          .filter((name) => name.length > 0)
          .sort((a, b) => a.localeCompare(b));

        this.applyFiltersAndSort();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Eroare la încărcarea categoriilor', error);
      },
    });
  }

  loadActiveAuctions(): void {
    this.isLoading = true;
    this.hasError = false;

    this.itemService.getActiveItems().subscribe({
      next: (items) => {
        this.allItems = items || [];
        this.applyFiltersAndSort();
        this.isLoading = false;
        this.cdr.detectChanges();

        if (this.authService.isLoggedIn()) {
          this.userService.getWishlist(this.currentUserId).subscribe({
            next: (wishlistItems: any[]) => {
              const wishlistIds = wishlistItems.map((w) => w.id || w.ID);
              console.log('AUCTIONS PAGE WISHLIST:', wishlistItems, 'IDS:', wishlistIds);
              this.allItems.forEach((item) => {
                item.isFavorite = wishlistIds.includes(item.ID);
                if (item.isFavorite) console.log('Marked as favorite:', item.Name);
              });
              this.applyFiltersAndSort();
              this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading wishlist in auctions page', err),
          });
        } else {
          this.allItems.forEach((item) => (item.isFavorite = false));
          this.applyFiltersAndSort();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Eroare la încărcarea licitațiilor active', err);
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFiltersAndSort(): void {
    let result = [...this.allItems];

    if (this.selectedCategory) {
      const selectedCategory = this.selectedCategory.trim().toLowerCase();

      result = result.filter((item) => this.getCategoryName(item).toLowerCase() === selectedCategory);
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

  toggleFavorite(item: any, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-page']);
      return;
    }

    // Update instantly (optimistic update)
    const originalState = item.isFavorite;
    item.isFavorite = !originalState;
    this.cdr.detectChanges();

    if (originalState) {
      this.userService.removeFromWishlist(this.currentUserId, item.ID).subscribe({
        next: () => {
          /* Server confirmed */
        },
        error: (err) => {
          item.isFavorite = originalState; // Revert
          this.cdr.detectChanges();
          console.error('Error removing from wishlist', err);
        },
      });
    } else {
      this.userService.addToWishlist(this.currentUserId, item.ID).subscribe({
        next: () => {
          /* Server confirmed */
        },
        error: (err) => {
          item.isFavorite = originalState; // Revert
          this.cdr.detectChanges();
          console.error('Error adding to wishlist', err);
        },
      });
    }
  }

 getRemainingTime(endDate: string | Date): string {
  const diffMs = new Date(endDate).getTime() - Date.now();

  if (diffMs <= 0) {
    return this.translate.instant('AUCTIONS_PAGE.TIME.ENDED');
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return this.translate.instant(
      'AUCTIONS_PAGE.TIME.DAYS_HOURS',
      { days, hours }
    );
  }

  if (hours > 0) {
    return this.translate.instant(
      'AUCTIONS_PAGE.TIME.HOURS_MINUTES',
      { hours, minutes }
    );
  }

  return this.translate.instant(
    'AUCTIONS_PAGE.TIME.MINUTES_SECONDS',
    { minutes, seconds }
  );
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
  isOwner(item: AuctionItem): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return false;
    const ownerId = item.OwnerId || (item.Owner as any)?.ID || (item.Owner as any)?.id;
    return +ownerId === currentUserId;
  }
}
