import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { AuctionItem } from '../../Models/item-model';
import { AuthService } from '../../services/auth';
import { ReviewService } from '../../app-logic/review';
import { CategoryService } from '../../services/category-service';
import { UserService } from '../../services/user-service';
import { TranslateService } from '@ngx-translate/core';
import { UserReadDto } from '../../Models/user/userDto';

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
  UserName: string;
  Name: string;
  Email: string;
  avatarUrl?: string;
  profilePictureName?: string;
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
  currentUserId: number = 0;
  categories: any[] = [];
  avatarUrl : string = '';
  defaultAvatar : string = 'assets/default-avatar.png';
  // --- User data ---
  user: UserProfile = {
    UserName: 'john_doe',
    Name: 'John Doe',
    Email: 'john@example.com',
    avatarUrl: 'assets/default-avatar.png',
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

  private readonly backendAssetsUrl = 'https://localhost:7137/Assets/ProfilePictures/';

  get displayAvatar(): string {
  if (this.user.profilePictureName) {
    return `${this.backendAssetsUrl}${this.user.profilePictureName}`;
  } 
  if (this.user.avatarUrl) {
    return this.user.avatarUrl;
  }  
  const name = encodeURIComponent(
    this.user.Name || this.translate.instant('PROFILE_PAGE.DEFAULTS.USER')
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
    private translate: TranslateService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const authUserId = this.authService.getCurrentUserId();
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.UserName = currentUser.username || currentUser.email || '';
      this.user.Name = currentUser.name || this.translate.instant('PROFILE_PAGE.DEFAULTS.USER');
      this.user.Email = currentUser.email || '';
      this.loadUserProfile(currentUser.ID);
    }
    this.currentUserId = authUserId !== null ? authUserId : 0;

    this.loadProfile();
    this.loadTheme();
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

  private getItemImage(item: any, allItems?: any[]): string {
    const itemId = item.id || item.ID;
    if (allItems && itemId) {
      const match = allItems.find((i) => (i.ID || i.id) === itemId);
      if (match) {
        const matchUrl = match.ImageUrl || match.imageUrl || (match.PhotoList && match.PhotoList.length > 0 ? match.PhotoList[0] : null) || (match.photoList && match.photoList.length > 0 ? match.photoList[0] : null);
        if (matchUrl) return this.itemService.formatImageUrl(matchUrl);
      }
    }

    const rawUrl = item.imageUrl || item.ImageUrl || (item.photoList && item.photoList.length > 0 ? item.photoList[0] : null) || (item.PhotoList && item.PhotoList.length > 0 ? item.PhotoList[0] : '');
    if (rawUrl) {
      return this.itemService.formatImageUrl(rawUrl);
    }

    const title = (item.title || item.name || item.Name || '').toLowerCase();
    if (title.includes('watch')) {
      return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop';
    }
    if (title.includes('bmw') || title.includes('car') || title.includes('leather') || title.includes('jacket')) {
      return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop';
    }
    return 'assets/images/placeholder.png';
  }

  // --- Load wishlist directly from localStorage ---
  private loadWishlistFromStorage(): void {
    if (!this.currentUserId) {
      this.wishItems = [];
      return;
    }
    const localWishIds: number[] = JSON.parse(
      localStorage.getItem(`wishlist_${this.currentUserId}`) || '[]'
    );
    const localWishRaw: any[] = JSON.parse(
      localStorage.getItem(`user_wishlist_items_${this.currentUserId}`) || '[]'
    );

    const validItems = localWishRaw.filter((item: any) =>
      localWishIds.includes(item.ID || item.id)
    );

    this.wishItems = validItems.map((item: any) => ({
      id: item.ID || item.id || 0,
      title: item.Name || item.name || 'Unknown Item',
      price: item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
      status: (item.Status || item.status || 'Active').toString(),
      image: this.getItemImage(item),
    }));
  }

  // --- Load API data ---
  loadItemsAndReviews(): void {
    if (!this.currentUserId || this.currentUserId === 0) {
      this.addedItems = [];
      this.bidItems = [];
      this.wishItems = [];
      return;
    }

    // Load Items listed by user
    this.itemService.getItems().subscribe({
      next: (items) => {
        // Filter items where OwnerId matches current user ID or username
        this.addedItems = items
          .filter((item: any) => {
            const ownerId = item.OwnerId ?? item.ownerId ?? item.Owner?.id ?? item.Owner?.ID;
            const ownerUsername = item.Owner?.username ?? item.Owner?.UserName ?? item.owner?.username ?? item.ownerUserName;

            const matchId = ownerId !== undefined && ownerId !== null && Number(ownerId) === this.currentUserId;
            const matchUser = ownerUsername && this.user.UserName && ownerUsername.toLowerCase() === this.user.UserName.toLowerCase();
            return matchId || matchUser;
          })
          .map((item: any) => ({
            id: item.ID || item.id || 0,
            title: item.Name || item.name || '',
            price: item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
            status: item.Status || item.status
              ? (item.Status || item.status).toString()
              : this.translate.instant('PROFILE_PAGE.STATUS.ADDED'),
            image: this.getItemImage(item, items),
          }));

        // Filter won items
        this.bidItems = items
          .filter((item: any) => {
            const winnerId = item.WinnerId ?? item.winnerId ?? item.Winner?.id ?? item.Winner?.ID;
            const isSold = (item.status === 'Sold' || item.Status === 'Sold') && (item.currentPrice > 0 || item.CurrentPrice > 0);
            return isSold && winnerId !== undefined && Number(winnerId) === this.currentUserId;
          })
          .map((item: any) => ({
            id: item.id || item.ID || 0,
            title: item.name || item.Name || '',
            price: item.currentPrice ?? item.CurrentPrice ?? 0,
            status: this.translate.instant('PROFILE_PAGE.STATUS.WON'),
            image: this.getItemImage(item, items),
          }));

        // Fetch wishlist items specifically from backend for current user
        this.UserService.getWishlist(this.currentUserId).subscribe({
          next: (wishlistItems: any[]) => {
            this.wishItems = (wishlistItems || []).map((item: any) => ({
              id: item.id || item.ID || 0,
              title: item.name || item.Name || 'Item',
              price: item.currentPrice ?? item.startPrice ?? item.CurrentPrice ?? item.StartPrice ?? 0,
              image: this.getItemImage(item, items),
              status: item.status
                ? item.status.toString()
                : this.translate.instant('PROFILE_PAGE.STATUS.ACTIVE'),
            }));
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading wishlist from API:', err);
            this.loadWishlistFromStorage();
          },
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
    if (!this.currentUserId) return;

    this.UserService.removeFromWishlist(this.currentUserId, itemId).subscribe({
      next: () => {
        this.wishItems = this.wishItems.filter((i) => i.id !== itemId);

        // Also update user-scoped local storage cache if present
        const localWishIds: number[] = JSON.parse(localStorage.getItem(`wishlist_${this.currentUserId}`) || '[]');
        const updatedIds = localWishIds.filter((id) => id !== itemId);
        localStorage.setItem(`wishlist_${this.currentUserId}`, JSON.stringify(updatedIds));

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
      const cached = JSON.parse(saved);
      // Only restore the avatar URL from cache.
      // username/name must NOT be overwritten here — they come from the JWT token.
      // Overwriting them causes the old username to reappear after a page refresh.
      if (cached.avatarUrl) {
        this.user.avatarUrl = cached.avatarUrl;
      }
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
      this.editDraft.UserName,
      this.editDraft.Name,
    ).subscribe({
      next: (updatedUser: any) => {
        // UserService.mapUser() returns UserReadDto with PascalCase fields (UserName, Name)
        this.user = {
          ...this.user,
          UserName: updatedUser.UserName || updatedUser.userName || this.editDraft.UserName,
          Name: updatedUser.Name || updatedUser.name || this.editDraft.Name,
        };
        if (this.selectedAvatarFile) {
          this.UserService.uploadProfilePicture(this.selectedAvatarFile).subscribe((pictureName: string) => {
            this.user.avatarUrl = this.itemService.formatImageUrl(`Assets/ProfilePictures/${pictureName}`);
          });
        }
        this.editDraft = { ...this.user };
        this.saveProfile();
        this.isEditing = false;
        this.cdr.detectChanges();
        alert(this.translate.instant('PROFILE_PAGE.MESSAGES.PROFILE_UPDATED'));
      },
      error: (err: any) => {
        const errorMsg =
          (err.error && typeof err.error === 'string' ? err.error : err.error?.message) ||
          'A apărut o eroare la actualizarea profilului.';
        alert(errorMsg);
        this.editDraft = { ...this.user };
      },
    });
  }

  private selectedAvatarFile: File | null = null;

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.editDraft.avatarUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.userService.uploadProfilePicture(file);
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

  loadUserProfile(userId: number): void {
    this.userService.getUser(userId).subscribe({
      next: (userData) => {
        this.user = userData;

        // Dacă utilizatorul are poză salvată pe backend, îi construim URL-ul
        if (userData.profilePictureName) {
          this.avatarUrl = `${this.backendAssetsUrl}${userData.profilePictureName}`;
        }
      },
      error: (err) => console.error('Eroare la încărcarea profilului:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const selectedFile = input.files[0];

      this.userService.uploadProfilePicture(selectedFile).subscribe({
        next: (newPictureName) => {
          this.avatarUrl = `${this.backendAssetsUrl}${newPictureName}`;
        },
        error: (err) => console.error('Eroare la upload:', err)
      });
    }
  }
}