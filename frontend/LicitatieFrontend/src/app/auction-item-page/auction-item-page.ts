import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// AJUSTARE: Modifică calea string ('../Services/auth.service') și numele clasei (AuthService) conform folderului creat de colegi
//import { AuthService } from '../Services/auth.service';
import { AuctionItem } from '../Models/item-model';
import { Category } from '../Models/categoryItem';
import { User, RoleEnum } from '../Models/user/user';

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

const mockCategory = new Category({ Id: 1, name: 'Electronics' });

const mockOwner = new User({
  ID: '1',
  UserName: 'alex.popescu',
  Name: 'Alex Popescu',
  Email: 'alex@example.com',
  Role: RoleEnum.USER,
  AddedItemsList: [],
  BidList: [],
  WonItemsList: [],
  WhishList: [],
  ReviewList: [],
});

@Component({
  selector: 'app-auction-item-page',
  standalone: false,
  templateUrl: './auction-item-page.html',
  styleUrl: './auction-item-page.css',
  providers: [MockAuthService],
})
export class AuctionItemPage implements OnInit {
  // Salvăm state-ul înainte să se piardă (getCurrentNavigation() merge doar în constructor)
  private navState: any;

  constructor(
    public authService: MockAuthService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.navState = nav?.extras?.state;
  }

  auctionItem: TestAuctionItem = {
    ID: 1,
    Name: 'Auction item',
    StartPrice: 100,
    CurrentPrice: 180,
    Category: mockCategory,
    CategoryId: 1,
    WishingUsers: [],
    Description: 'A premium item with excellent condition and fast shipping.',
    Location: 'Bucharest',
    Owner: mockOwner,
    OwnerId: 1,
    Status: 'Active',
    StartDate: new Date('2026-07-01'),
    EndDate: new Date('2026-07-20'),
    BidList: [],
    photoGallery: ['https://via.placeholder.com/150'],
  };

  bidAmount = this.auctionItem.CurrentPrice + 10;
  isInWishlist: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // Preluăm datele anunțului trimise din home-page / auctions-page
    const auction = this.navState?.auction;
    if (auction) {
      if (auction.title) this.auctionItem.Name = auction.title;
      if (auction.currentBid) {
        this.auctionItem.CurrentPrice = auction.currentBid;
        this.auctionItem.StartPrice = auction.currentBid;
        this.bidAmount = auction.currentBid + 10;
      }
      if (auction.image) this.auctionItem.photoGallery = [auction.image];
    }
  }

  placeBid(): void {
    this.errorMessage = '';

    if (this.bidAmount <= this.auctionItem.CurrentPrice) {
      this.errorMessage = 'The bid must be greater than the current price.';
      return;
    }

    if (this.bidAmount <= this.auctionItem.StartPrice) {
      this.errorMessage = 'The bid must be greater than the minimum price.';
      return;
    }

    this.auctionItem.CurrentPrice = this.bidAmount;
    this.bidAmount = this.auctionItem.CurrentPrice + 10;
  }

  redirectToLogin(): void {
    // AJUSTARE: Modifică ruta '/login' în cazul în care colegii din echipa de rutare au definit altă cale (ex: '/auth/login')
    this.router.navigate(['/login']);
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
  }
}
