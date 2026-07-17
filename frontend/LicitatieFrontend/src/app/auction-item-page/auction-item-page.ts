import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
// AJUSTARE: Modifică calea string ('../Services/auth.service') și numele clasei (AuthService) conform folderului creat de colegi
//import { AuthService } from '../Services/auth.service';
import { AuctionItem } from '../Models/item-model';
import { Category } from '../Models/categoryItem';
import { User, RoleEnum } from '../Models/user/user';

interface TestAuctionItem extends AuctionItem {
}

class MockAuthService {
  isLoggedIn(): boolean {
    return true;
    return true;
  }
  getCurrentUser(): string {
    return 'Alex Popescu';
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
export class AuctionItemPage implements OnInit, OnDestroy {

  private navState: any;
  selectedImageIndex = 0;
  peekOffset = 0;
  isInWishlist: boolean = false;
  errorMessage: string = '';
  countdownText: string = '';
  private timerInterval: any;

  constructor(
    public authService: MockAuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    this.navState = nav?.extras?.state;
  }

  auctionItem: TestAuctionItem = {
    ID: 1,
    Name: 'BMW Series 3',
    StartPrice: 100,
    CurrentPrice: 180,
    Category: mockCategory,
    CategoryId: 1,
    WishingUsers: [],
    Description: 'A premium item with excellent condition, full service history, fast shipping, and exceptional luxury features.',
    Location: 'Bucharest',
    Owner: mockOwner,
    OwnerId: 1,
    Status: 'Active',
    StartDate: new Date('2026-07-01'),
    EndDate: new Date('2026-07-20'),
    BidList: [],
    PhotoList: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop'
    ]
  };

  bidAmount = this.auctionItem.CurrentPrice + 10;

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });


    this.selectedImageIndex = 0;


    const auction = this.navState?.auction;
    if (auction) {
      if (auction.title || auction.Name) this.auctionItem.Name = auction.title || auction.Name;

      if (auction.currentBid || auction.CurrentPrice) {
        const price = auction.currentBid || auction.CurrentPrice;
        this.auctionItem.CurrentPrice = price;
        this.auctionItem.StartPrice = price;
        this.bidAmount = price + 10;
      }

      const photos = auction.PhotoList || auction.photoList;
      if (photos && photos.length > 0) {
        this.auctionItem.PhotoList = photos;
      } else if (auction.image) {
        this.auctionItem.PhotoList = [auction.image];
      }

      const desc = auction.description || auction.Description;
      if (desc) {
        this.auctionItem.Description = desc;
      }

      const loc = auction.Location || auction.location;
      if (loc) {
        this.auctionItem.Location = loc;
      }

      const start = auction.StartDate || auction.startDate;
      if (start) {
        this.auctionItem.StartDate = new Date(start);
      }

      const end = auction.EndDate || auction.endDate;
      if (end) {
        this.auctionItem.EndDate = new Date(end);
      }
    }


    this.startCountdown();


    const wishlist: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.isInWishlist = wishlist.includes(this.auctionItem.ID);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startCountdown(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(this.auctionItem.EndDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        this.countdownText = 'Auction ended';
        this.cdr.detectChanges();
        clearInterval(this.timerInterval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const dStr = days > 0 ? `${days}d ` : '';
      const hStr = hours.toString().padStart(2, '0') + 'h ';
      const mStr = minutes.toString().padStart(2, '0') + 'm ';
      const sStr = seconds.toString().padStart(2, '0') + 's';

      this.countdownText = `${dStr}${hStr}${mStr}${sStr}`;
      this.cdr.detectChanges();
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
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
    this.router.navigate(['/login-page']);
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
    let wishlist: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (this.isInWishlist) {
      if (!wishlist.includes(this.auctionItem.ID)) {
        wishlist.push(this.auctionItem.ID);
      }
    } else {
      wishlist = wishlist.filter(id => id !== this.auctionItem.ID);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    if (this.auctionItem.PhotoList && this.auctionItem.PhotoList.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.auctionItem.PhotoList.length) % this.auctionItem.PhotoList.length;
      this.cdr.detectChanges();
    }
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.auctionItem.PhotoList && this.auctionItem.PhotoList.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.auctionItem.PhotoList.length;
      this.cdr.detectChanges();
    }
  }

  goToImage(idx: number): void {
    this.selectedImageIndex = idx;
    this.cdr.detectChanges();
  }

  setPeek(offset: number): void {
    if (!this.auctionItem.PhotoList || this.auctionItem.PhotoList.length <= 1) {
      return;
    }

    if (offset > 0 && this.selectedImageIndex === 0) {
      this.peekOffset = 0;
    } else if (offset < 0 && this.selectedImageIndex === this.auctionItem.PhotoList.length - 1) {
      this.peekOffset = 0;
    } else {
      this.peekOffset = offset;
    }
    this.cdr.detectChanges();
  }
}