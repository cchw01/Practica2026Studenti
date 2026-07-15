import { Component } from '@angular/core';
import { Router } from '@angular/router';
// AJUSTARE: Modifică calea string ('../Services/auth.service') și numele clasei (AuthService) conform folderului creat de colegi
//import { AuthService } from '../Services/auth.service'; 
import { AuctionItem } from '../Models/item-model';
import { StatusEnum } from '../Models/status-enum';

interface TestAuctionItem extends AuctionItem {
  photoGallery?: string[];
}

class MockAuthService {
  isLoggedIn(): boolean {
    return true; 
  }
  getCurrentUser(): string {
    return 'Alex Popescu'; 
  }
}

@Component({
  selector: 'app-auction-item-page',
  standalone: false,
  templateUrl: './auction-item-page.html',
  styleUrl: './auction-item-page.css',
  providers: [MockAuthService]
})
export class AuctionItemPage {
  constructor(
    public authService: MockAuthService,
    private router: Router
  ) {}

  auctionItem: TestAuctionItem = {
    id: 1,
    name: 'Auction item',
    startPrice: 100,
    currentPrice: 180,
    category: 'Electronics',
    description: 'A premium item with excellent condition and fast shipping.',
    location: 'Bucharest',
    owner: 'Alex Popescu',
    status: 'Active',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-20'),
    photoGallery: ['https://via.placeholder.com/150']
  };

  bidAmount = this.auctionItem.currentPrice + 10;
  isInWishlist: boolean = false;
  errorMessage: string = '';



  placeBid(): void {
    this.errorMessage = '';

    if (this.bidAmount <= this.auctionItem.currentPrice) {
      this.errorMessage = 'The bid must be greater than the current price.';
      return;
    }

    if (this.bidAmount <= this.auctionItem.startPrice) {
      this.errorMessage = 'The bid must be greater than the minimum price.';
      return;
    }

    this.auctionItem.currentPrice = this.bidAmount;
    this.bidAmount = this.auctionItem.currentPrice + 10;
  }

  redirectToLogin(): void {
    // AJUSTARE: Modifică ruta '/login' în cazul în care colegii din echipa de rutare au definit altă cale (ex: '/auth/login')
    this.router.navigate(['/login']);
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
  }
}