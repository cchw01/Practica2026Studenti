import { Component, OnInit, Service } from '@angular/core';
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
    private categoryService: CategoryService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    
    // --- REDIRECȚIONARE AUTOMATĂ CORECTĂ PENTRU ADMIN ---
    if (currentUser) {
      // Verificăm dacă contul are rol de admin sau dacă e adresa configurată de admin
      if (currentUser.role === 'admin' || currentUser.email === 'admin@bidsphere.com') {
        localStorage.setItem('user_role', 'admin'); // Salvează starea pentru panoul Vuexy
        this.router.navigate(['/admin']);
        return; // Oprim execuția codului pentru a nu mai încărca restul paginii
      }
    }

    // --- Fluxul normal pentru utilizatorii simpli ---
    if (currentUser) {
      this.user.username = currentUser.username || currentUser.email;
      this.user.name = currentUser.name || this.translate.instant('PROFILE_PAGE.DEFAULTS.USER');
      this.user.email = currentUser.email;
      this.currentUserId = +currentUser.id || 3;
    }

    this.loadProfile();
    this.loadTheme();
    this.loadItemsAndReviews();

    // ---- Aici adaugi citirea categoriilor ----
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

  // --- Load API data ---
  loadItemsAndReviews(): void {
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.addedItems = items
          .filter(
            (item: any) => item.ownerId === this.currentUserId || item.owner === this.user.username,
          )
          .map((item: any) => ({
            id: item.id || 0,
            title: item.name,
            price: item.currentPrice || item.startPrice,
            status: item.status
              ? item.status.toString()
              : this.translate.instant('PROFILE_PAGE.STATUS.ADDED'),
          }));

        this.bidItems = items
          .filter((item: any) => item.status === 'Sold' && item.currentPrice > 0)
          .map((item: any) => ({
            id: item.id || 0,
            title: item.name,
            price: item.currentPrice,
            status: this.translate.instant('PROFILE_PAGE.STATUS.WON'),
          }));

        this.wishItems = items
          .filter(
            (item: any) =>
              Array.isArray(item.wishingUsers) &&
              item.wishingUsers.some(
                (u: any) => u.id === this.currentUserId || u.ID === this.currentUserId,
              ),
          )
          .map((item: any) => ({
            id: item.id || item.ID || 0,
            title: item.name || item.Name,
            price: item.currentPrice || item.startPrice,
            status: item.status
              ? item.status.toString()
              : this.translate.instant('PROFILE_PAGE.STATUS.ACTIVE'),
          }));
      },
      error: (err) => console.error(this.translate.instant('PROFILE_PAGE.ERRORS.LOAD_ITEMS'), err),
    });

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
      error: (err) =>
        console.error(this.translate.instant('PROFILE_PAGE.ERRORS.LOAD_REVIEWS'), err),
    });
  }

  private loadProfile(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.user = JSON.parse(saved);
    }
  }

  private saveProfile(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
  }

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
        next: (res) => {
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

  onLogout(): void {
    this.authService.logout();
    localStorage.removeItem('user_role');
    this.setTheme('light');
    document.body.className = '';
    this.router.navigate(['/login-page']);
  }
}