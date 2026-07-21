import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { AuctionItem } from '../../Models/item-model';
import { AuthService } from '../../services/auth';
import { ReviewService } from '../../app-logic/review';
import { CategoryService } from '../../services/category-service';
import { UserService } from '../../services/user-service';
import { TranslateService } from '@ngx-translate/core';

interface Item {
  id: number;
  title: string;
  price: number;
  status: string;
  image?: string;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface UserProfile {
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
}

const STORAGE_KEY = 'profile_user';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  // --- Edit mode ---
  isEditing = false;
  currentUserId: number = 3; // Default fallback
  categories: any[] = [];

  // --- User data ---
  user: UserProfile = {
    username: 'john_doe',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: '',
  };

  editDraft: UserProfile = { ...this.user };

  // --- Score ---
  score: number = 4.5;

  // --- Theme ---
  currentTheme: string = 'light';

  // --- Change Password Form ---
  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordMessage = '';
  passwordError = false;

  // --- Lists ---
  addedItems: Item[] = [];
  bidItems: Item[] = [];
  wishItems: Item[] = [];
  reviews: Review[] = [];

  // --- Stars helper ---
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get displayAvatar(): string {
    if (this.user.avatarUrl) return this.user.avatarUrl;
    const name = encodeURIComponent(
      this.user.name || this.translate.instant('PROFILE_PAGE.DEFAULTS.USER'),
    );
    return `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff&size=120`;
  }

  constructor(
    private authService: AuthService,
    private UserService: UserService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private router: Router,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.username = currentUser.username || currentUser.email;
      this.user.name = currentUser.name || this.translate.instant('PROFILE_PAGE.DEFAULTS.USER');
      this.user.email = currentUser.email;
      this.currentUserId = +currentUser.id || 3;
    }

    this.loadProfile();
    this.loadTheme();
    this.loadWishlistFromStorage();
    this.loadItemsAndReviews();

    // Fetch category list
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) =>
        console.error(this.translate.instant('PROFILE_PAGE.ERRORS.LOAD_CATEGORIES'), err),
    });
  }

  // --- Theme actions ---
  setTheme(theme: string): void {
    this.currentTheme = theme;
    localStorage.setItem('app_theme', theme);
    document.body.className = `theme-${theme}`;
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('app_theme') || 'light';
    this.setTheme(savedTheme);
  }

  // --- Load wishlist directly from localStorage ---
  private loadWishlistFromStorage(): void {
    const localWishIds: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const localWishRaw: any[] = JSON.parse(localStorage.getItem('user_wishlist_items') || '[]');

    const validItems = localWishRaw.filter((item: any) =>
      localWishIds.includes(item.ID || item.id)
    );

    this.wishItems = validItems.map((item: any) => ({
      id: item.ID || item.id || 0,
      title: item.Name || item.name || 'Unknown Item',
      price: item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
      status: (item.Status || item.status || 'Active').toString(),
      image: item.imageUrl || item.ImageUrl || (item.photoList && item.photoList.length > 0 ? item.photoList[0] : null) || 'assets/images/placeholder.png',
    }));
  }

  // --- Load API data ---
  loadItemsAndReviews(): void {
    // Load Items listed by user
    this.itemService.getItems().subscribe({
      next: (items) => {
        // Filter items where OwnerId matches current user ID
        this.addedItems = items
          .filter(
            (item: any) =>
              item.OwnerId === this.currentUserId ||
              item.ownerId === this.currentUserId ||
              item.Owner?.UserName === this.user.username ||
              item.owner?.username === this.user.username,
          )
          .map((item: any) => ({
            id: item.ID || item.id || 0,
            title: item.Name || item.name || '',
            price: item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
            status: item.Status || item.status
              ? (item.Status || item.status).toString()
              : this.translate.instant('PROFILE_PAGE.STATUS.ADDED'),
            image: item.imageUrl || item.ImageUrl || 'assets/images/placeholder.png',
          }));

        // Filter won items
        this.bidItems = items
          .filter((item: any) => item.status === 'Sold' && item.currentPrice > 0)
          .map((item: any) => ({
            id: item.id || 0,
            title: item.name,
            price: item.currentPrice,
            status: this.translate.instant('PROFILE_PAGE.STATUS.WON'),
            image: item.imageUrl || item.ImageUrl || 'assets/images/placeholder.png',
          }));

        // Fetch wishlist items specifically from backend
        this.UserService.getWishlist(this.currentUserId).subscribe({
          next: (wishlistItems: any[]) => {
            const backendWishItems: Item[] = wishlistItems.map((item: any) => ({
              id: item.id || item.ID || 0,
              title: item.name || item.Name || 'Item',
              price: item.currentPrice || item.startPrice || 0,
              image: item.imageUrl || item.ImageUrl || (item.photoList && item.photoList.length > 0 ? item.photoList[0] : null) || 'assets/images/placeholder.png',
              status: item.status
                ? item.status.toString()
                : this.translate.instant('PROFILE_PAGE.STATUS.ACTIVE'),
            }));

            // Merge with items loaded from localStorage as fallback
            const mergedIds = new Set(backendWishItems.map((i) => i.id));
            const extraLocal = this.wishItems.filter((i) => !mergedIds.has(i.id));
            this.wishItems = [...backendWishItems, ...extraLocal];
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error loading wishlist:', err),
        });
      },
      error: (err) => console.error('Error loading items:', err),
    });

    // Load reviews
    this.reviewService.getReviews().subscribe({
      next: (reviews: any[]) => {
        this.reviews = reviews
          .filter((r) => r.ReviewedUserId === this.currentUserId)
          .map((r) => ({
            id: r.Id,
            author: r.ReviewerUserName || 'Anonymous',
            rating: r.Rating,
            comment: r.Comment,
            date: r.ReviewDate
              ? new Date(r.ReviewDate).toLocaleDateString()
              : new Date().toLocaleDateString(),
          }));

        if (this.reviews.length > 0) {
          const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
          this.score = parseFloat((sum / this.reviews.length).toFixed(1));
        } else {
          this.score = 4.5;
        }
      },
      error: (err) => console.error('Error loading reviews:', err.message || err),
    });
  }

  removeFromWishlist(itemId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.UserService.removeFromWishlist(this.currentUserId, itemId).subscribe({
      next: () => {
        this.wishItems = this.wishItems.filter((i) => i.id !== itemId);
        
        // Also update local storage cache if present
        const localWishIds: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const updatedIds = localWishIds.filter((id) => id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(updatedIds));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error removing from wishlist', err),
    });
  }

  // --- Navigate to Item Details ---
  goToItem(id: number): void {
    if (id) {
      this.router.navigate(['/auctions', id]);
    }
  }

  // --- Persistence ---
  private loadProfile(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.user = JSON.parse(saved);
    }
  }

  private saveProfile(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
  }

  // --- Edit actions ---
  startEdit(): void {
    this.editDraft = { ...this.user };
    this.isEditing = true;
    this.showPasswordForm = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordMessage = '';
    this.passwordError = false;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.showPasswordForm = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordMessage = '';
    this.passwordError = false;
  }

  saveEdit(): void {
    this.UserService.updateUser(
      this.currentUserId,
      this.editDraft.username,
      this.editDraft.name,
    ).subscribe({
      next: (updatedUser: any) => {
        this.user = {
          ...this.user,
          username: updatedUser.userName,
          name: updatedUser.name,
        };
        this.saveProfile();
        this.isEditing = false;
        alert(this.translate.instant('PROFILE_PAGE.MESSAGES.PROFILE_UPDATED'));
      },
      error: (err: any) => {
        const errorMsg = err.error || 'A apărut o eroare la actualizarea profilului.';
        alert(errorMsg);
        this.editDraft = { ...this.user };
      },
    });
  }

  // --- Avatar upload ---
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.editDraft.avatarUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // --- Change Password ---
  onChangePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = true;
      this.passwordMessage = this.translate.instant('PROFILE_PAGE.PASSWORD.REQUIRED');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = true;
      this.passwordMessage = this.translate.instant('PROFILE_PAGE.PASSWORD.NOT_MATCH');
      return;
    }

    this.authService
      .changePassword(this.currentUserId, this.currentPassword, this.newPassword)
      .subscribe({
        next: () => {
          this.passwordError = false;
          this.passwordMessage = this.translate.instant('PROFILE_PAGE.PASSWORD.SUCCESS');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => (this.passwordMessage = ''), 3000);
        },
        error: (err) => {
          this.passwordError = true;
          this.passwordMessage =
            err.error?.message || this.translate.instant('PROFILE_PAGE.PASSWORD.ERROR');
        },
      });
  }

  // --- Navigate to Add Item ---
  goToAddItem(): void {
    this.router.navigate(['/add-item']);
  }

  // --- Navigate to Auction Item page ---
  goToAuction(itemId: number): void {
    if (!itemId) return;
    this.router.navigate(['/action-item-page', itemId]);
  }

  // --- Logout ---
  onLogout(): void {
    this.authService.logout();
    this.setTheme('light');
    document.body.className = '';
    this.router.navigate(['/login-page']);
  }
}