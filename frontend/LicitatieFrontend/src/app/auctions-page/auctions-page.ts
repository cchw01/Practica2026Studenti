import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionItem } from '../Models/item-model';
import { ItemService } from '../services/item-service';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../services/category-service';
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

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private categoryService: CategoryService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  currentUserId: number = 3; // hardcoded like in profile-page

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        if (this.allItems.length > 0) {
          this.applyFiltersAndSort();
        }
      }
    });

    const authUserId = this.authService.getCurrentUserId();
    if (authUserId !== null) {
      this.currentUserId = authUserId;
    }

    this.loadActiveAuctions();

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.map((c) => c.name);
      },
      error: (err) => console.error('Eroare la încărcarea categoriilor', err),
    });
  }

  loadActiveAuctions(): void {
    this.isLoading = true;
    this.hasError = false;

    this.itemService.getActiveItems().subscribe({
      next: (items) => {
        this.allItems = items;
        // build category list from returned active items
        const fromItems = [...new Set(items.filter(i => i.Category?.name).map(i => i.Category.name))];
        if (this.categories.length === 0) {
          this.categories = fromItems;
        }
        this.applyFiltersAndSort();
        this.isLoading = false;
        this.cdr.detectChanges();
        
        // Fetch wishlist
        this.userService.getWishlist(this.currentUserId).subscribe({
          next: (wishlistItems: any[]) => {
            const wishlistIds = wishlistItems.map(w => w.id || w.ID);
            console.log("AUCTIONS PAGE WISHLIST:", wishlistItems, "IDS:", wishlistIds);
            this.allItems.forEach(item => {
              item.isFavorite = wishlistIds.includes(item.ID);
              if (item.isFavorite) console.log("Marked as favorite:", item.Name);
            });
            this.applyFiltersAndSort();
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error loading wishlist in auctions page', err)
        });
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

  toggleFavorite(item: any, event: Event): void {
    event.stopPropagation();
    
    // Update instantly (optimistic update)
    const originalState = item.isFavorite;
    item.isFavorite = !originalState;
    this.cdr.detectChanges();
    
    if (originalState) {
      this.userService.removeFromWishlist(this.currentUserId, item.ID).subscribe({
        next: () => { /* Server confirmed */ },
        error: (err) => {
          item.isFavorite = originalState; // Revert
          this.cdr.detectChanges();
          console.error('Error removing from wishlist', err);
        }
      });
    } else {
      this.userService.addToWishlist(this.currentUserId, item.ID).subscribe({
        next: () => { /* Server confirmed */ },
        error: (err) => {
          item.isFavorite = originalState; // Revert
          this.cdr.detectChanges();
          console.error('Error adding to wishlist', err);
        }
      });
    }
  }

  getRemainingTime(endDate: string | Date): string {
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

