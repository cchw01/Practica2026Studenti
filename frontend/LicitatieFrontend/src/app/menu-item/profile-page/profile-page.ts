import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { AuctionItem } from '../../Models/item-model';
import { AuthService } from '../../services/auth';
import { ReviewService } from '../../app-logic/review';

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
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  // --- Edit mode ---
  isEditing = false;
  currentUserId: number = 3; // Default fallback

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

  // --- Add Item Form ---
  showAddItemForm = false;
  newItemName = '';
  newItemPrice = 0;
  newItemCategory = '1'; // Default Category ID
  newItemDescription = '';
  newItemLocation = '';
  newItemDuration = 3; // Days
  itemMessage = '';
  itemError = false;

  // --- Lists ---
  addedItems: Item[] = [];
  bidItems: Item[] = [];
  reviews: Review[] = [];

  // --- Stars helper ---
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get displayAvatar(): string {
    if (this.user.avatarUrl) return this.user.avatarUrl;
    const name = encodeURIComponent(this.user.name || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff&size=120`;
  }

  constructor(
    private authService: AuthService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.username = currentUser.username || currentUser.email;
      this.user.name = currentUser.name || 'User';
      this.user.email = currentUser.email;
      this.currentUserId = +currentUser.id || 3;
    }

    this.loadProfile();
    this.loadTheme();
    this.loadItemsAndReviews();
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
    // Load Items listed by user
    this.itemService.getItems().subscribe({
      next: (items) => {
        // Filter items where OwnerId matches current user ID
        this.addedItems = items
          .filter(
            (item: any) => item.ownerId === this.currentUserId || item.owner === this.user.username,
          )
          .map((item: any) => ({
            id: item.id || 0,
            title: item.name,
            price: item.currentPrice || item.startPrice,
            status: item.status ? item.status.toString() : 'Added',
          }));

        // Filter won items
        this.bidItems = items
          .filter((item: any) => item.status === 'Sold' && item.currentPrice > 0) // Mock bid items or won
          .map((item: any) => ({
            id: item.id || 0,
            title: item.name,
            price: item.currentPrice,
            status: 'Won',
          }));
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
            author: r.Reviewer?.UserName || 'Anonymous',
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
          this.score = 4.5; // Default fallback score
        }
      },
      error: (err) => console.error('Error loading reviews:', err),
    });
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
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveEdit(): void {
    this.user = { ...this.editDraft };
    this.saveProfile();
    this.isEditing = false;
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
      this.passwordMessage = 'All fields are required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = true;
      this.passwordMessage = 'The new password and its confirmation do not match.';
      return;
    }

    this.authService
      .changePassword(this.currentUserId, this.currentPassword, this.newPassword)
      .subscribe({
        next: (res) => {
          this.passwordError = false;
          this.passwordMessage = 'Password updated successfully!';
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
          setTimeout(() => (this.passwordMessage = ''), 3000);
        },
        error: (err) => {
          this.passwordError = true;
          this.passwordMessage =
            err.error?.message || 'Error updating password. Please check your current password.';
        },
      });
  }

  // --- Add Item ---
  onAddItem(): void {
    if (!this.newItemName || this.newItemPrice <= 0 || !this.newItemLocation) {
      this.itemError = true;
      this.itemMessage = 'Name, starting price, and location are required.';
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + this.newItemDuration * 24 * 60 * 60 * 1000);

    const newItem: any = {
      name: this.newItemName,
      startPrice: this.newItemPrice,
      currentPrice: this.newItemPrice,
      categoryId: +this.newItemCategory,
      description: this.newItemDescription,
      location: this.newItemLocation,
      ownerId: this.currentUserId,
      status: 'Added',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    this.itemService.createItem(newItem).subscribe({
      next: () => {
        this.itemError = false;
        this.itemMessage = 'Item successfully published for auction!';
        this.newItemName = '';
        this.newItemPrice = 0;
        this.newItemDescription = '';
        this.newItemLocation = '';
        this.loadItemsAndReviews(); // Reload list
        setTimeout(() => (this.itemMessage = ''), 3000);
      },
      error: (err) => {
        this.itemError = true;
        this.itemMessage = 'Error publishing the item.';
        console.error(err);
      },
    });
  }

  // --- Logout ---
  onLogout(): void {
    this.authService.logout();
    this.setTheme('light'); // Reset theme classes
    document.body.className = '';
    this.router.navigate(['/login-page']);
  }
}
