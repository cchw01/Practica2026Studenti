import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { AuctionItem } from '../../Models/item-model';
import { AuthService } from '../../services/auth';
import { ReviewService } from '../../app-logic/review';
import { PictureService, LocalPicture } from '../../services/picture-service'
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
    const name = encodeURIComponent(this.user.name || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff&size=120`;
  }

  constructor(
    private authService: AuthService,
    private itemService: ItemService,
    private reviewService: ReviewService,
    private pictureService: PictureService,
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

        // Filter wish list items (items where current user is in WishingUsers)
        this.wishItems = items
          .filter((item: any) =>
            Array.isArray(item.wishingUsers) &&
            item.wishingUsers.some(
              (u: any) => u.id === this.currentUserId || u.ID === this.currentUserId
            )
          )
          .map((item: any) => ({
            id: item.id || item.ID || 0,
            title: item.name || item.Name,
            price: item.currentPrice || item.startPrice,
            status: item.status ? item.status.toString() : 'Active',
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
    this.user = { ...this.editDraft };
    this.saveProfile();
    this.isEditing = false;
    this.showPasswordForm = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordMessage = '';
    this.passwordError = false;
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
      const picture : LocalPicture[] = [
      {
        name: file.name,
        file: file,
      }];
      this.pictureService.addPictures(picture).subscribe({
      next: (res) => {
           console.log('Upload reușit!', res);
      },
      error: (err) => {
          console.error('Eroare la upload:', err);
  }
});
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

  // --- Navigate to Add Item ---
  goToAddItem(): void {
    this.router.navigate(['/add-item']);
  }

  // --- Logout ---
  onLogout(): void {
    this.authService.logout();
    this.setTheme('light'); // Reset theme classes
    document.body.className = '';
    this.router.navigate(['/login-page']);
  }
}
