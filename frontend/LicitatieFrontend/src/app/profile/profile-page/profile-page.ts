import { Component } from '@angular/core';

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

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  user = {
    username: 'ion_popescu',
    name: 'Ion Popescu',
    email: 'ion.popescu@email.com',
  };

  score: number = 4.6;

  addedItems: Item[] = [
    { id: 1, title: 'Dell XPS 15 Laptop', price: 3500, status: 'Active' },
    { id: 2, title: 'Vintage Seiko Watch', price: 800, status: 'Sold' },
    { id: 3, title: 'Canon EOS Camera', price: 1200, status: 'Active' },
  ];

  bidItems: Item[] = [
    { id: 4, title: 'Original Grigorescu Painting', price: 5000, status: 'Won' },
    { id: 5, title: 'PS5 Console', price: 1800, status: 'Lost' },
    { id: 6, title: 'Trek Bicycle', price: 2200, status: 'Pending' },
  ];

  reviews: Review[] = [
    { id: 1, author: 'maria_m', rating: 5, comment: 'Serious seller, fast delivery!', date: 'Jun 10, 2025' },
    { id: 2, author: 'alex_d', rating: 4, comment: 'Item as described. Recommended.', date: 'May 2, 2025' },
    { id: 3, author: 'gheorghe_p', rating: 5, comment: 'Excellent experience, everything perfect.', date: 'Apr 15, 2025' },
  ];

  get avatarUrl(): string {
    const name = encodeURIComponent(this.user.name);
    return `https://ui-avatars.com/api/?name=${name}&background=6c63ff&color=fff&size=120`;
  }

  get stars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
