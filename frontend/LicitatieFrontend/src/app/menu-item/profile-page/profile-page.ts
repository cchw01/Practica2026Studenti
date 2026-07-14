import { Component, OnInit } from '@angular/core';

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
