import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ItemService } from '../services/item-service';
import { BidService } from '../services/bid-service';
import { AuctionItem } from '../Models/item-model';
import { Category } from '../Models/categoryItem';
import { User, RoleEnum } from '../Models/user/user';

const defaultCategory = new Category({ Id: 1, name: 'Vehicles' });
const defaultOwner = new User({
  ID: '3',
  UserName: 'test',
  Name: 'Test Owner',
  Email: 'test@example.com',
  Role: RoleEnum.USER,
  AddedItemsList: [],
  BidList: [],
  WonItemsList: [],
  WhishList: [],
  ReviewList: []
});

@Component({
  selector: 'app-auction-item-page',
  standalone: false,
  templateUrl: './auction-item-page.html',
  styleUrl: './auction-item-page.scss'
})
export class AuctionItemPage implements OnInit, OnDestroy {

  private navState: any;
  selectedImageIndex = 0;
  peekOffset = 0;
  isInWishlist: boolean = false;
  showWishlistToast: boolean = false;
  toastMessage: string = '';
  toastAction: 'added' | 'removed' = 'added';
  isToastHiding: boolean = false;
  private toastTimeout: any;
  private toastHideTimeout: any;

  // Report functionality
  showReportModal: boolean = false;
  reportReason: string = 'Inappropriate Content';
  reportDetails: string = '';
  isReported: boolean = false;
  showReportToast: boolean = false;
  reportToastMessage: string = '';
  isReportToastHiding: boolean = false;
  private reportToastTimeout: any;
  private reportToastHideTimeout: any;

  errorMessage: string = '';
  countdownText: string = '';
  private timerInterval: any;

  auctionItem: AuctionItem = {
    ID: 1,
    Name: 'Loading Item...',
    StartPrice: 100,
    CurrentPrice: 100,
    Category: defaultCategory,
    CategoryId: 1,
    WishingUsers: [],
    Description: 'Detailed description loading...',
    Location: 'Location',
    Owner: defaultOwner,
    OwnerId: 3,
    Status: 'Active' as any,
    StartDate: new Date(),
    EndDate: new Date(Date.now() + 7 * 86400000),
    BidList: [],
    PhotoList: []
  };

  bidAmount = this.auctionItem.CurrentPrice + 10;

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private itemService: ItemService,
    private bidService: BidService,
    private cdr: ChangeDetectorRef
  ) {
    const nav = this.router.getCurrentNavigation();
    this.navState = nav?.extras?.state;
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    this.selectedImageIndex = 0;

    const auctionFromState = this.navState?.auction;
    if (auctionFromState) {
      this.setAuctionItemData(auctionFromState);
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const itemId = Number(idParam);
      if (!isNaN(itemId) && itemId > 0) {
        this.itemService.getItemById(itemId).subscribe({
          next: (liveItem) => {
            if (liveItem) {
              this.setAuctionItemData(liveItem);
            }
          },
          error: (err) => {
            console.error('Could not fetch live item by ID:', err);
          }
        });
      }
    }

    this.startCountdown();

    const wishlist: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.isInWishlist = wishlist.includes(this.auctionItem.ID);

    const reportedList: number[] = JSON.parse(localStorage.getItem('reported_items') || '[]');
    this.isReported = reportedList.includes(this.auctionItem.ID);
  }

  private setAuctionItemData(item: any): void {
    if (!item) return;

    if (item.ID) this.auctionItem.ID = item.ID;
    if (item.Name || item.title) this.auctionItem.Name = item.Name || item.title;

    const currentP = item.CurrentPrice ?? item.currentBid ?? item.StartPrice;
    if (currentP !== undefined) {
      this.auctionItem.CurrentPrice = currentP;
      this.auctionItem.StartPrice = item.StartPrice ?? currentP;
      this.bidAmount = currentP + 10;
    }

    if (item.Category) {
      this.auctionItem.Category = typeof item.Category === 'string'
        ? new Category({ Id: item.CategoryId || 1, name: item.Category })
        : item.Category;
    }

    if (item.Description || item.description) {
      this.auctionItem.Description = item.Description || item.description;
    }

    if (item.Location || item.location) {
      this.auctionItem.Location = item.Location || item.location;
    }

    if (item.Owner || item.owner) {
      this.auctionItem.Owner = item.Owner || item.owner;
    }

    if (item.StartDate || item.startDate) {
      this.auctionItem.StartDate = new Date(item.StartDate || item.startDate);
    }

    if (item.EndDate || item.endDate) {
      this.auctionItem.EndDate = new Date(item.EndDate || item.endDate);
    }

    const galleryMap: { [key: string]: string[] } = {
      'Vehicles': [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop'
      ],
      'Art': [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop'
      ],
      'Clothing': [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop'
      ],
      'Electronics': [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop'
      ],
      'Real Estate': [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop'
      ]
    };

    const catName = this.auctionItem.Category?.name || 'Vehicles';
    const defaultGallery = galleryMap[catName] || galleryMap['Vehicles'];

    if (item.ID === 2 || (this.auctionItem.Name && this.auctionItem.Name.toLowerCase().includes('watch'))) {
      this.auctionItem.PhotoList = galleryMap['Art'];
    } else {
      const photos = item.PhotoList || item.photoList;
      if (Array.isArray(photos) && photos.length >= 2) {
        this.auctionItem.PhotoList = photos;
      } else if (Array.isArray(photos) && photos.length === 1) {
        this.auctionItem.PhotoList = [photos[0], ...defaultGallery.slice(1)];
      } else if (item.ImageUrl || item.image) {
        const img = item.ImageUrl || item.image;
        const formattedImg = img.startsWith('http') ? img : `https://localhost:7137${img}`;
        this.auctionItem.PhotoList = [formattedImg, ...defaultGallery.slice(1)];
      } else {
        this.auctionItem.PhotoList = defaultGallery;
      }
    }

    try {
      this.cdr.markForCheck();
    } catch {}
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
        try { this.cdr.markForCheck(); } catch {}
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
      try { this.cdr.markForCheck(); } catch {}
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

    const currentUser = this.authService.getCurrentUser();
    const bidderId = currentUser ? (+currentUser.id || 3) : 3;

    this.bidService.addBid({
      bidderId: bidderId,
      biddedItemId: this.auctionItem.ID,
      price: this.bidAmount
    }).subscribe({
      next: (res) => {
        this.auctionItem.CurrentPrice = this.bidAmount;
        this.bidAmount = this.auctionItem.CurrentPrice + 10;
        try { this.cdr.markForCheck(); } catch {}
      },
      error: (err) => {
        // Fallback local state if offline
        this.auctionItem.CurrentPrice = this.bidAmount;
        this.bidAmount = this.auctionItem.CurrentPrice + 10;
        try { this.cdr.markForCheck(); } catch {}
      }
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/login-page']);
  }

  toggleWishlist(): void {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    this.isInWishlist = !this.isInWishlist;
    let wishlist: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');

    if (this.isInWishlist) {
      if (!wishlist.includes(this.auctionItem.ID)) {
        wishlist.push(this.auctionItem.ID);
      }
      this.toastAction = 'added';
      this.toastMessage = `${this.auctionItem.Name} added to Wishlist!`;
    } else {
      wishlist = wishlist.filter(id => id !== this.auctionItem.ID);
      this.toastAction = 'removed';
      this.toastMessage = `${this.auctionItem.Name} removed from Wishlist.`;
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    let userWishlist: any[] = JSON.parse(localStorage.getItem('user_wishlist_items') || '[]');
    if (this.isInWishlist) {
      if (!userWishlist.some((i: any) => i.ID === this.auctionItem.ID)) {
        userWishlist.push(this.auctionItem);
      }
    } else {
      userWishlist = userWishlist.filter((i: any) => i.ID !== this.auctionItem.ID);
    }
    localStorage.setItem('user_wishlist_items', JSON.stringify(userWishlist));

    this.showWishlistToast = true;
    this.isToastHiding = false;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.toastHideTimeout) clearTimeout(this.toastHideTimeout);

    this.toastHideTimeout = setTimeout(() => {
      this.isToastHiding = true;
      try { this.cdr.markForCheck(); } catch {}
    }, 800);

    this.toastTimeout = setTimeout(() => {
      this.showWishlistToast = false;
      this.isToastHiding = false;
      try { this.cdr.markForCheck(); } catch {}
    }, 1200);

    try { this.cdr.markForCheck(); } catch {}
  }

  // Report Modal & Handling
  openReportModal(): void {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }
    this.showReportModal = true;
    try { this.cdr.markForCheck(); } catch {}
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportDetails = '';
    try { this.cdr.markForCheck(); } catch {}
  }

  submitReport(): void {
    this.isReported = true;
    this.showReportModal = false;

    let reportedList: number[] = JSON.parse(localStorage.getItem('reported_items') || '[]');
    if (!reportedList.includes(this.auctionItem.ID)) {
      reportedList.push(this.auctionItem.ID);
    }
    localStorage.setItem('reported_items', JSON.stringify(reportedList));

    let reportLogs: any[] = JSON.parse(localStorage.getItem('reported_items_details') || '[]');
    reportLogs.push({
      itemId: this.auctionItem.ID,
      itemName: this.auctionItem.Name,
      reason: this.reportReason,
      details: this.reportDetails,
      date: new Date().toISOString()
    });
    localStorage.setItem('reported_items_details', JSON.stringify(reportLogs));

    this.reportToastMessage = `Report submitted for review. Thank you!`;
    this.showReportToast = true;
    this.isReportToastHiding = false;

    if (this.reportToastTimeout) clearTimeout(this.reportToastTimeout);
    if (this.reportToastHideTimeout) clearTimeout(this.reportToastHideTimeout);

    this.reportToastHideTimeout = setTimeout(() => {
      this.isReportToastHiding = true;
      try { this.cdr.markForCheck(); } catch {}
    }, 1500);

    this.reportToastTimeout = setTimeout(() => {
      this.showReportToast = false;
      this.isReportToastHiding = false;
      try { this.cdr.markForCheck(); } catch {}
    }, 2000);

    this.reportDetails = '';
    try { this.cdr.markForCheck(); } catch {}
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    if (this.auctionItem.PhotoList && this.auctionItem.PhotoList.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.auctionItem.PhotoList.length) % this.auctionItem.PhotoList.length;
      try { this.cdr.markForCheck(); } catch {}
    }
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.auctionItem.PhotoList && this.auctionItem.PhotoList.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.auctionItem.PhotoList.length;
      try { this.cdr.markForCheck(); } catch {}
    }
  }

  goToImage(idx: number): void {
    this.selectedImageIndex = idx;
    try { this.cdr.markForCheck(); } catch {}
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
    try { this.cdr.markForCheck(); } catch {}
  }
}