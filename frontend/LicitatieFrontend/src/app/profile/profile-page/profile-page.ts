import { Component, OnInit } from '@angular/core';
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

  // --- User data ---
  user: UserProfile = {
    username: '',
    name: '',
    email: '',
    avatarUrl: '',
  };

  editDraft: UserProfile = { ...this.user };

  // --- Score ---
  score: number = 0;

  // --- Lists (empty until connected to API) ---
  addedItems: Item[] = [];
  bidItems: Item[] = [];
  reviews: Review[] = [];

   constructor(private reviewService: ReviewService) {}

  // --- Stars helper ---
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  get displayAvatar(): string {
    if (this.user.avatarUrl) return this.user.avatarUrl;
    const name = encodeURIComponent(this.user.name || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff&size=120`;
  }

  // --- Lifecycle ---
  ngOnInit(): void {
    this.loadProfile();
    this.loadReviews();
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


  private loadReviews(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.reviewService.getReviewsForUser(userId).subscribe({
      next: (data: any[]) => {
        this.reviews = data.map(r => ({
          id: r.id,
          author: r.reviewer?.username ?? 'Unknown',
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.reviewDate).toLocaleDateString(),
        }));
        this.score = this.reviews.length
          ? this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length
          : 0;
      },
      error: (err: any) => console.error('Eroare la încărcarea review-urilor', err),
    });
  }

  private getCurrentUserId(): number | null {
    // TODO: adapteaza in functie de unde stochezi id-ul userului logat (auth service / token)
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.id ?? null;
    }
    return null;
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
    this.saveProfile();   // persist to localStorage
    this.isEditing = false;
    // TODO: replace saveProfile() with an API call when backend is ready
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
}
