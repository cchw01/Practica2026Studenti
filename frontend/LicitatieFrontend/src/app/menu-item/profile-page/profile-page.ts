import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { AuctionItem } from '../../Models/item-model';
import { AuthService } from '../../services/auth';
import { ReviewService } from '../../services/review-service';
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
  reviewerId: number;
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
  profilePictureBase64?: string;
  // Numele fisierului asa cum e salvat pe backend (in wwwroot/Assets/ProfilePictures).
  // E sursa de adevar pentru poza persistata; profilePictureBase64 e doar preview local,
  // inainte de a apasa Save.
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

  // --- User data ---
  user: UserProfile = {
    username: 'john_doe',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: '',
  };

  editDraft: UserProfile = { ...this.user };

  // Fisierul selectat pentru upload, retinut pana la Save
  private selectedAvatarFile: File | null = null;

  private readonly backendAssetsUrl = 'https://localhost:7137/Assets/ProfilePictures/';

  // --- Score ---
  score: number = 0;

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
  outbidItems: Item[] = [];
  wishItems: Item[] = [];
  reviews: Review[] = [];

  // --- Stars helper ---
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get displayAvatar(): string {
    // Preview local (poza abia selectata, inainte de Save) are prioritate maxima
    if (this.user?.profilePictureBase64) {
      if (!this.user.profilePictureBase64.startsWith('data:image')) {
        return `data:image/png;base64,${this.user.profilePictureBase64}`;
      }
      return this.user.profilePictureBase64;
    }
    // Apoi poza deja salvata pe backend
    if (this.user?.profilePictureName) {
      return `${this.backendAssetsUrl}${this.user.profilePictureName}`;
    }
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
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    // Verificăm dacă utilizatorul este logat
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-page']);
      return;
    }

    const authUserId = this.authService.getCurrentUserId();
    const currentUser = this.authService.getCurrentUser();

    // --- REDIRECȚIONARE AUTOMATĂ CORECTĂ PENTRU ADMIN ---
    if (currentUser) {
      // Verificăm dacă contul are rol de admin sau dacă e adresa configurată de admin
      if (currentUser.role === 'Admin' || currentUser.email === 'admin@bidsphere.com') {
        localStorage.setItem('user_role', 'admin'); // Salvează starea pentru panoul Vuexy
        this.router.navigate(['/admin']);
        return; // Oprim execuția codului pentru a nu mai încărca restul paginii
      }
    }

    // --- Fluxul normal pentru utilizatorii simpli ---
    if (currentUser) {
      this.user.username = currentUser.username || currentUser.email || '';
      this.user.name = currentUser.name || this.translate.instant('PROFILE_PAGE.DEFAULTS.USER');
      this.user.email = currentUser.email || '';
    }
    this.currentUserId = authUserId !== null ? authUserId : 0;

    // Fetch up-to-date user data from backend to avoid stale token data
    if (this.currentUserId > 0) {
      this.UserService.getUser(this.currentUserId).subscribe({
        next: (apiUser: any) => {
          this.user.username = apiUser.UserName || apiUser.userName || this.user.username;
          this.user.name = apiUser.Name || apiUser.name || this.user.name;
          this.user.email = apiUser.Email || apiUser.email || this.user.email;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to fetch latest user data', err),
      });
    }

    this.loadProfile();
    this.loadTheme();
    this.loadItemsAndReviews();

    // Incarcam datele complete de la backend (inclusiv poza de profil salvata),
    // altfel dupa refresh poza uploadata anterior nu s-ar mai afisa niciodata.
    if (this.currentUserId) {
      this.UserService.getUser(this.currentUserId).subscribe({
        next: (userData: any) => {
          // profilePictureName venit de la GetUser e mereu null pe backend (nu e populat).
          // Poza reala se ia separat, ca Base64, de la endpointul dedicat.
          this.UserService.getProfilePicture(this.currentUserId).subscribe({
            next: (base64: string) => {
              this.user.profilePictureBase64 = base64;
              this.cdr.detectChanges();
            },
            error: () => {
              // Userul nu are inca poza de profil setata - e ok, ramane avatarul implicit.
            },
          });
        },
        error: (err) => console.error('Eroare la incarcarea profilului:', err),
      });
    }

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
        const matchUrl =
          match.ImageUrl ||
          match.imageUrl ||
          (match.PhotoList && match.PhotoList.length > 0 ? match.PhotoList[0] : null) ||
          (match.photoList && match.photoList.length > 0 ? match.photoList[0] : null);
        if (matchUrl) return this.itemService.formatImageUrl(matchUrl);
      }
    }

    const rawUrl =
      item.imageUrl ||
      item.ImageUrl ||
      (item.photoList && item.photoList.length > 0 ? item.photoList[0] : null) ||
      (item.PhotoList && item.PhotoList.length > 0 ? item.PhotoList[0] : '');
    if (rawUrl) {
      return this.itemService.formatImageUrl(rawUrl);
    }

    const title = (item.title || item.name || item.Name || '').toLowerCase();
    if (title.includes('watch')) {
      return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop';
    }
    if (
      title.includes('bmw') ||
      title.includes('car') ||
      title.includes('leather') ||
      title.includes('jacket')
    ) {
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
      localStorage.getItem(`wishlist_${this.currentUserId}`) || '[]',
    );
    const localWishRaw: any[] = JSON.parse(
      localStorage.getItem(`user_wishlist_items_${this.currentUserId}`) || '[]',
    );

    const validItems = localWishRaw.filter((item: any) =>
      localWishIds.includes(item.ID || item.id),
    );

    if (validItems.length > 0) {
      this.wishItems = validItems.map((item: any) => ({
        id: item.ID || item.id || 0,
        title: item.Name || item.name || 'Unknown Item',
        price: item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
        status: (item.Status || item.status || 'Active').toString(),
        image: this.getItemImage(item),
      }));
    } else if (localWishIds.length > 0) {
      this.itemService.getItems().subscribe({
        next: (allItems) => {
          this.wishItems = allItems
            .filter((item: any) => localWishIds.includes(item.ID || item.id))
            .map((item: any) => ({
              id: item.ID || item.id || 0,
              title: item.Name || item.name || 'Item',
              price:
                item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
              status: (item.Status || item.status || 'Active').toString(),
              image: this.getItemImage(item, allItems),
            }));
          this.cdr.detectChanges();
        },
      });
    } else {
      this.wishItems = [];
    }
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
            const ownerUsername =
              item.Owner?.username ??
              item.Owner?.UserName ??
              item.owner?.username ??
              item.ownerUserName;

            const matchId =
              ownerId !== undefined && ownerId !== null && Number(ownerId) === this.currentUserId;
            const matchUser =
              ownerUsername &&
              this.user.username &&
              ownerUsername.toLowerCase() === this.user.username.toLowerCase();

            const isOwner = matchId || matchUser;
            const status = (item.Status || item.status || '').toString().toLowerCase();
            // In backend the statuses are: Added, Validated, ActiveBid, NoWinner, Sold, Rejected.
            const isActive =
              status === 'validated' || status === 'activebid' || status === 'active';

            return isOwner && isActive;
          })
          .map((item: any) => ({
            id: item.ID || item.id || 0,
            title: item.Name || item.name || '',
            price:
              item.CurrentPrice ?? item.currentPrice ?? item.StartPrice ?? item.startPrice ?? 0,
            status:
              item.Status || item.status
                ? (item.Status || item.status).toString()
                : this.translate.instant('PROFILE_PAGE.STATUS.ADDED'),
            image: this.getItemImage(item, items),
          }));

        this.bidItems = items
          .filter((item: any) => {
            const winnerId = item.WinnerId ?? item.winnerId ?? item.Winner?.id ?? item.Winner?.ID;
            const isSold =
              (item.status === 'Sold' || item.Status === 'Sold') &&
              (item.currentPrice > 0 || item.CurrentPrice > 0);
            return isSold && winnerId !== undefined && Number(winnerId) === this.currentUserId;
          })
          .map((item: any) => ({
            id: item.id || item.ID || 0,
            title: item.name || item.Name || '',
            price: item.currentPrice ?? item.CurrentPrice ?? 0,
            status: this.translate.instant('PROFILE_PAGE.STATUS.WON'),
            image: this.getItemImage(item, items),
          }));
        this.outbidItems = items
          .filter((item: any) => {
            const bids = item.BidList || item.bidList || [];

            const hasBid = bids.some(
              (b: any) => Number(b.bidderId || b.BidderId) === this.currentUserId,
            );

            const isSold = item.status === 'Sold' || item.Status === 'Sold';
            const winnerId = item.WinnerId ?? item.winnerId ?? item.Winner?.id ?? item.Winner?.ID;

            if (isSold && winnerId !== undefined && Number(winnerId) !== this.currentUserId) {
              return true;
            }

            const isActive =
              item.status === 'ActiveBid' ||
              item.Status === 'ActiveBid' ||
              item.status === 'Active' ||
              item.Status === 'Active';
            if (isActive && bids.length > 0) {
              const highestBid = [...bids].sort(
                (a: any, b: any) => (b.price || b.Price) - (a.price || a.Price),
              )[0];
              if (Number(highestBid.bidderId || highestBid.BidderId) !== this.currentUserId) {
                return true;
              }
            }

            return false;
          })
          .map((item: any) => ({
            id: item.id || item.ID || 0,
            title: item.name || item.Name || '',
            price: item.currentPrice ?? item.CurrentPrice ?? 0,
            status: 'Outbid',
            image: this.getItemImage(item, items),
          }));
        // Fetch wishlist items specifically from backend for current user
        this.UserService.getWishlist(this.currentUserId).subscribe({
          next: (wishlistItems: any[]) => {
            this.wishItems = (wishlistItems || [])
              .map((item: any) => {
                const itemId = item.id || item.ID || 0;
                const matchedItem = items.find((i: any) => (i.ID || i.id) === itemId);
                const sourceItem = matchedItem || item;
                return {
                  id: itemId,
                  title: sourceItem.Name || sourceItem.name || sourceItem.title || 'Item',
                  price:
                    sourceItem.CurrentPrice ??
                    sourceItem.currentPrice ??
                    sourceItem.StartPrice ??
                    sourceItem.startPrice ??
                    0,
                  image:
                    sourceItem.imageUrl ||
                    sourceItem.ImageUrl ||
                    (sourceItem.photoList && sourceItem.photoList.length > 0
                      ? sourceItem.photoList[0]
                      : null) ||
                    this.getItemImage(sourceItem, items),
                  status:
                    sourceItem.status || sourceItem.Status
                      ? (sourceItem.status || sourceItem.Status).toString()
                      : this.translate.instant('PROFILE_PAGE.STATUS.ACTIVE'),
                };
              })
              .filter((item) => item.id > 0);
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

    this.reviewService.getReviews().subscribe({
      next: (reviews: any[]) => {
        this.reviews = reviews
          .filter((r) => r.reviewedUserId === this.currentUserId)
          .map((r) => ({
            id: r.id,
            reviewerId: r.reviewerId,
            author: r.reviewerUserName || 'Anonymous',
            rating: r.rating,
            comment: r.comment,
            date: r.reviewDate
              ? new Date(r.reviewDate).toLocaleDateString()
              : new Date().toLocaleDateString(),
          }));

        if (this.reviews.length > 0) {
          const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
          this.score = parseFloat((sum / this.reviews.length).toFixed(1));
        } else {
          this.score = 0;
        }
      },
      error: (err: any) => console.error('Error loading reviews:', err.message || err),
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
        const localWishIds: number[] = JSON.parse(
          localStorage.getItem(`wishlist_${this.currentUserId}`) || '[]',
        );
        const updatedIds = localWishIds.filter((id) => id !== itemId);
        localStorage.setItem(`wishlist_${this.currentUserId}`, JSON.stringify(updatedIds));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error removing from wishlist', err),
    });
  }

  // --- Badge styling ---
  getBadgeClass(status: string): string {
    if (!status) return 'badge-added';
    const lower = status.toLowerCase();
    if (lower.includes('activebid') || lower.includes('active')) return 'badge-activebid';
    if (lower.includes('added')) return 'badge-added';
    if (lower.includes('sold')) return 'badge-sold';
    if (lower.includes('nowinner')) return 'badge-nowinner';
    if (lower.includes('validated')) return 'badge-validated';
    if (lower.includes('won')) return 'badge-won';
    if (lower.includes('outbid')) return 'badge-nowinner';
    return 'badge-added';
  }

  // --- Navigate to Item Details ---
  goToItem(id: number): void {
    if (id) {
      this.router.navigate(['/action-item-page', id]);
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

  startEdit(): void {
    this.editDraft = { ...this.user };
    this.selectedAvatarFile = null;
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
    this.selectedAvatarFile = null;
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
        // UserService.mapUser() returns UserReadDto with PascalCase fields (UserName, Name)
        this.user = {
          ...this.user,
          username: updatedUser.UserName || updatedUser.userName || this.editDraft.username,
          name: updatedUser.Name || updatedUser.name || this.editDraft.name,
        };

        // Daca a fost selectata o poza noua, o urcam acum pe backend
        if (this.selectedAvatarFile) {
          this.UserService.uploadProfilePicture(this.selectedAvatarFile).subscribe({
            next: (pictureBase64: string) => {
              // Backend-ul intoarce continutul Base64 al pozei, nu un nume de fisier,
              // asa ca il stocam ca Base64 (displayAvatar stie sa il transforme in data URI).
              this.user.profilePictureBase64 = pictureBase64;
              this.user.profilePictureName = undefined;
              this.selectedAvatarFile = null;
              this.editDraft = { ...this.user };
              this.saveProfile();
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Eroare la upload-ul pozei de profil:', err);
              alert('Poza de profil nu a putut fi salvata.');
            },
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
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.editDraft.avatarUrl = reader.result as string;
      this.editDraft.profilePictureBase64 = reader.result as string;
      // FileReader este un API nativ de browser; callback-ul lui 'onload' nu e
      // mereu prins automat de Angular/Zone.js, asa ca fortam explicit un ciclu
      // de detectare a schimbarilor ca preview-ul sa apara imediat, din prima selectie.
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);

    // Resetam valoarea input-ului, altfel unele browsere nu mai declanseaza
    // evenimentul (change) daca utilizatorul reselecteaza acelasi fisier.
    input.value = '';
  }

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

  goToAddItem(): void {
    this.router.navigate(['/add-item']);
  }

  // --- Navigate to Auction Item page ---
  goToAuction(itemId: number, item?: any): void {
    if (!itemId) return;
    this.router.navigate(['/action-item-page', itemId], item ? { state: { auction: item } } : {});
  }

  onLogout(): void {
    this.authService.logout();
    localStorage.removeItem('user_role');
    this.setTheme('light');
    this.router.navigate(['/login-page']);
  }
}
