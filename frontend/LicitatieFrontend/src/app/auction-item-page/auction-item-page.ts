import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserService } from '../services/user-service';
import { ItemService } from '../services/item-service';
import { BidService } from '../services/bid-service';
import { AuctionItem } from '../Models/item-model';
import { Category } from '../Models/categoryItem';
import { User, RoleEnum } from '../Models/user/user';
import { TranslateService } from '@ngx-translate/core';
import { ReportService } from '../services/report-service';
import { CategoryService } from '../services/category-service';

function mapReasonToBackend(reason: string): 'Spam' | 'Harassment' | 'InappropriateContent' | 'Fraud' | 'Other' {
  switch (reason) {
    case 'Inappropriate Content':
      return 'InappropriateContent';
    case 'Fake or Counterfeit Item':
      return 'Fraud';
    case 'Misleading Description':
    case 'Suspicious Bidding Activity':
    case 'Other':
    default:
      return 'Other';
  }
}

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
  ReviewList: [],
});

@Component({
  selector: 'app-auction-item-page',
  standalone: false,
  templateUrl: './auction-item-page.html',
  styleUrl: './auction-item-page.scss',
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
  isSubmittingReport: boolean = false;
  showReportToast: boolean = false;
  reportToastMessage: string = '';
  isReportToastHiding: boolean = false;
  private reportToastTimeout: any;
  private reportToastHideTimeout: any;

  // Edit functionality
  showEditModal: boolean = false;
  editData: any = {};
  categories: Category[] = [];
  errorMessage: string = '';
  countdownText: string = '';
  private timerInterval: any;

  // ================= NEW: Debug control =================
  public readonly showDebugControls = true; // set to false before final commit

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
    PhotoList: [],
  };

  bidAmount = this.auctionItem.CurrentPrice + 10;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private bidService: BidService,
    private route: ActivatedRoute,
    private itemService: ItemService,
    private reportService: ReportService,
    private categoryService: CategoryService,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.navState = nav?.extras?.state;
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    this.selectedImageIndex = 0;
    this.categoryService.getCategories().subscribe({
    next: (categories) => {
        this.categories = categories;

        try {
          this.cdr.markForCheck();
        } catch {}
      },
      error: (err) => {
        console.error('Could not load categories:', err);
      }
    });
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
              this.checkIfReported();
            }
          },
          error: (err) => {
            console.error('Could not fetch live item by ID:', err);
          },
        });
      }
    }

    this.startCountdown();

    const currentUserId = this.authService.getCurrentUserId();

    if (currentUserId) {
      this.userService.getWishlist(currentUserId).subscribe({
        next: (wishlistItems: any[]) => {
          const targetId = (this.auctionItem as any)?.id || this.auctionItem?.ID || 0;
          const wishlistIds = (wishlistItems || []).map((w) => w.id || w.ID);
          this.isInWishlist = wishlistIds.includes(targetId);
          try {
            this.cdr.markForCheck();
          } catch {}
        },
        error: (err) => console.error('Error fetching wishlist for item page', err),
      });
    }

    this.checkIfReported();
  }

  private checkIfReported(): void {
    const currentUserId = this.authService.getCurrentUserId();
    const storageKey = currentUserId ? `reported_items_${currentUserId}` : null;

    if (!storageKey) {
      this.isReported = false;
      return;
    }

    const reportedList: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    this.isReported = reportedList.includes(this.auctionItem.ID);
    try {
      this.cdr.markForCheck();
    } catch { }
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
    const categoryId =
      item.CategoryId ??
      item.categoryId ??
      item.Category?.Id ??
      item.Category?.id;

    if (categoryId !== undefined && categoryId !== null) {
      this.auctionItem.CategoryId = Number(categoryId);
    }
    if (item.Category) {
      this.auctionItem.Category =
        typeof item.Category === 'string'
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
      const ownerObj = item.Owner || item.owner;
      this.auctionItem.OwnerId = Number(ownerObj.id || ownerObj.ID || item.OwnerId || item.ownerId);
    } else if (item.OwnerId || item.ownerId) {
      this.auctionItem.OwnerId = Number(item.OwnerId || item.ownerId);
    }

    this.auctionItem.HasBids =
          item.HasBids ?? item.hasBids ?? false;


    if (item.StartDate || item.startDate) {
      this.auctionItem.StartDate = new Date(item.StartDate || item.startDate);
    }

    if (item.EndDate || item.endDate) {
      this.auctionItem.EndDate = new Date(item.EndDate || item.endDate);
    }

    const galleryMap: { [key: string]: string[] } = {
      Vehicles: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
      ],
      Art: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop',
      ],
      Clothing: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop',
      ],
      Electronics: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop',
      ],
      'Real Estate': [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
      ],
    };

    const catName = this.auctionItem.Category?.name || 'Vehicles';
    const defaultGallery = galleryMap[catName] || galleryMap['Vehicles'];

    const photos = item.PhotoList || item.photoList;
    if (Array.isArray(photos) && photos.length > 0) {
      this.auctionItem.PhotoList = photos.map((img: string) =>
        img.startsWith('http') || img.startsWith('data:') ? img : `https://localhost:7137${img}`,
      );
    } else if (item.ImageUrl || item.image) {
      const img = item.ImageUrl || item.image;
      const formattedImg =
        img.startsWith('http') || img.startsWith('data:') ? img : `https://localhost:7137${img}`;
      this.auctionItem.PhotoList = [formattedImg];
    } else {
      this.auctionItem.PhotoList = [];
    }
    const reportedList: number[] = JSON.parse(localStorage.getItem('reported_items') || '[]');
    this.isReported = reportedList.includes(this.auctionItem.ID);

    try {
      this.cdr.markForCheck();
    } catch {}
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
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
        try {
          this.cdr.markForCheck();
        } catch {}
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
      try {
        this.cdr.markForCheck();
      } catch {}
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

    if (this.bidAmount < this.auctionItem.CurrentPrice + 1) {
      this.errorMessage = `The minimum bid is ${this.auctionItem.CurrentPrice + 1} RON.`;
      return;
    }

    const bidderId = this.authService.getCurrentUserId() || 0;

    this.bidService
      .addBid({
        bidderId: bidderId,
        biddedItemId: this.auctionItem.ID,
        price: this.bidAmount,
      })
      .subscribe({
        next: (res) => {
          this.auctionItem.CurrentPrice = this.bidAmount;
          this.bidAmount = this.auctionItem.CurrentPrice + 10;
          try {
            this.cdr.markForCheck();
          } catch {}
        },
        error: (err) => {
          // Fallback local state if offline
          this.auctionItem.CurrentPrice = this.bidAmount;
          this.bidAmount = this.auctionItem.CurrentPrice + 10;
          this.errorMessage =
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || err.message || 'Failed to place bid. Please try again.';
          try {
            this.cdr.detectChanges();
          } catch {}
        },
      });
  }

  redirectToLogin(): void {
    this.router.navigate(['/login-page']);
  }

  toggleWishlist(): void {
    const currentUserId = this.authService.getCurrentUserId();

    if (!currentUserId || !this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    const itemId = (this.auctionItem as any).id || this.auctionItem.ID;

    // Update instantly (optimistic update)
    const originalState = this.isInWishlist;
    this.isInWishlist = !originalState;
    try {
      this.cdr.detectChanges();
    } catch {}

    if (originalState) {
      this.userService.removeFromWishlist(currentUserId, itemId).subscribe({
        next: () => {
          this.toastAction = 'removed';
          this.toastMessage = `${this.auctionItem.Name} removed from Wishlist.`;
          this.showWishlistToastMessage();
        },
        error: (err) => {
          this.isInWishlist = originalState; // Revert
          try {
            this.cdr.detectChanges();
          } catch {}
          console.error('Error removing from wishlist', err);
        },
      });
    } else {
      this.userService.addToWishlist(currentUserId, itemId).subscribe({
        next: () => {
          this.toastAction = 'added';
          this.toastMessage = `${this.auctionItem.Name} added to Wishlist!`;
          this.showWishlistToastMessage();
        },
        error: (err) => {
          this.isInWishlist = originalState; // Revert
          try {
            this.cdr.detectChanges();
          } catch {}
          console.error('Error adding to wishlist', err);
        },
      });
    }
  }

  private showWishlistToastMessage(): void {
    const currentUserId = this.authService.getCurrentUserId();
    const storageKey = currentUserId ? `wishlist_${currentUserId}` : 'wishlist';
    let wishlist: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (this.isInWishlist) {
      if (!wishlist.includes(this.auctionItem.ID)) {
        wishlist.push(this.auctionItem.ID);
      }
    } else {
      wishlist = wishlist.filter((id) => id !== this.auctionItem.ID);
    }
    localStorage.setItem(storageKey, JSON.stringify(wishlist));

    this.showWishlistToast = true;
    this.isToastHiding = false;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.toastHideTimeout) clearTimeout(this.toastHideTimeout);

    this.toastHideTimeout = setTimeout(() => {
      this.isToastHiding = true;
      try {
        this.cdr.markForCheck();
      } catch {}
    }, 800);

    this.toastTimeout = setTimeout(() => {
      this.showWishlistToast = false;
      this.isToastHiding = false;
      try {
        this.cdr.markForCheck();
      } catch {}
    }, 1200);

    try {
      this.cdr.markForCheck();
    } catch {}
  }

  // Report Modal & Handling
  openReportModal(): void {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }
    this.showReportModal = true;
    try {
      this.cdr.markForCheck();
    } catch {}
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportDetails = '';
    try {
      this.cdr.markForCheck();
    } catch {}
  }

  submitReport(): void {
    if (this.isSubmittingReport) {
      return;
    }

    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      this.redirectToLogin();
      return;
    }

    this.isSubmittingReport = true;

    const payload = {
      targetType: 'AuctionItem',
      targetId: this.auctionItem.ID,
      reason: mapReasonToBackend(this.reportReason),
      description: this.reportDetails?.trim() ? `${this.reportReason}: ${this.reportDetails.trim()}` : this.reportReason,
      reporterId: currentUserId,
    } as any;

    this.reportService.addReport(payload).subscribe({
      next: () => {
        this.isReported = true;
        this.isSubmittingReport = false;
        this.showReportModal = false;

        const storageKey = `reported_items_${currentUserId}`;
        let reportedList: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!reportedList.includes(this.auctionItem.ID)) {
          reportedList.push(this.auctionItem.ID);
        }
        localStorage.setItem(storageKey, JSON.stringify(reportedList));

        this.reportToastMessage = `Report submitted for review. Thank you!`;
        this.showReportToast = true;
        this.isReportToastHiding = false;

        if (this.reportToastTimeout) clearTimeout(this.reportToastTimeout);
        if (this.reportToastHideTimeout) clearTimeout(this.reportToastHideTimeout);

        this.reportToastHideTimeout = setTimeout(() => {
          this.isReportToastHiding = true;
          try {
            this.cdr.markForCheck();
          } catch { }
        }, 1500);

        this.reportToastTimeout = setTimeout(() => {
          this.showReportToast = false;
          this.isReportToastHiding = false;
          try {
            this.cdr.markForCheck();
          } catch { }
        }, 2000);

        this.reportDetails = '';
        try {
          this.cdr.markForCheck();
        } catch { }
      },
      error: (err) => {
        console.error('Error submitting item report:', err);
        this.isSubmittingReport = false;

        // Dacă e deja raportat (duplicate detection din backend), marcăm oricum ca raportat
        if (err?.error?.includes && err.error.includes('există deja')) {
          this.isReported = true;
          const storageKey = `reported_items_${currentUserId}`;
          let reportedList: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
          if (!reportedList.includes(this.auctionItem.ID)) {
            reportedList.push(this.auctionItem.ID);
          }
          localStorage.setItem(storageKey, JSON.stringify(reportedList));
        }

        this.showReportModal = false;
        try {
          this.cdr.markForCheck();
        } catch { }
      },
    });
  }

  prevImage(event: Event): void {
    event.stopPropagation();
    if (this.auctionItem.PhotoList && this.auctionItem.PhotoList.length > 1) {
      this.selectedImageIndex =
        (this.selectedImageIndex - 1 + this.auctionItem.PhotoList.length) %
        this.auctionItem.PhotoList.length;
      try {
        this.cdr.markForCheck();
      } catch {}
    }
  }

  nextImage(event: Event): void {
    event.stopPropagation();
    if (this.auctionItem.PhotoList && this.auctionItem.PhotoList.length > 1) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.auctionItem.PhotoList.length;
      try {
        this.cdr.markForCheck();
      } catch {}
    }
  }

  goToImage(idx: number): void {
    this.selectedImageIndex = idx;
    try {
      this.cdr.markForCheck();
    } catch {}
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
    try {
      this.cdr.markForCheck();
    } catch {}
  }
  

  openEditModal(): void {
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }
    if (!this.isOwner()) {
      return;
    }

    if (this.auctionItem.HasBids) {
      this.reportToastMessage =
        'Itemul nu mai poate fi editat deoarece a primit deja o ofertă.';

      this.showReportToast = true;
      this.isReportToastHiding = false;

      try {
        this.cdr.markForCheck();
      } catch {}

      return;
    }

    this.editData = {
      name: this.auctionItem.Name,
      startPrice: this.auctionItem.StartPrice,
      categoryId: this.auctionItem.CategoryId || this.auctionItem.Category?.Id || 1,
      location: this.auctionItem.Location,
      description: this.auctionItem.Description
    };

    this.showEditModal = true;

    try {
      this.cdr.markForCheck();
    } catch { }
  }

  //Closing Modal
  closeEditModal(): void {
    this.showEditModal = false;
    this.editData = {}; 
    try {
      this.cdr.markForCheck();
    } catch { }
  }

  //Submit edits
  
  submitEdit(): void {
    if (!this.isOwner()) {
      return;
    }

    if (this.auctionItem.HasBids) {
      this.reportToastMessage =
        'Itemul nu mai poate fi editat deoarece a primit deja o ofertă.';

      this.showReportToast = true;
      this.isReportToastHiding = false;

      return;
    }
    if (!this.editData.name?.trim()) {
      this.reportToastMessage = 'Numele este obligatoriu.';
      this.showReportToast = true;
      return;
    }

    if (
      this.editData.startPrice === null ||
      this.editData.startPrice === undefined ||
      Number(this.editData.startPrice) <= 0
    ) {
      this.reportToastMessage =
        'Prețul de pornire trebuie să fie mai mare decât 0.';
      this.showReportToast = true;
      return;
    }

    if (!this.editData.categoryId) {
      this.reportToastMessage = 'Categoria este obligatorie.';
      this.showReportToast = true;
      return;
    }

    if (!this.editData.location?.trim()) {
      this.reportToastMessage = 'Locația este obligatorie.';
      this.showReportToast = true;
      return;
    }

    const itemToUpdate = { ...this.auctionItem };
    itemToUpdate.Name = this.editData.name;
    itemToUpdate.StartPrice = Number(this.editData.startPrice);
    itemToUpdate.CategoryId = Number(this.editData.categoryId);
    itemToUpdate.Description = this.editData.description;
    itemToUpdate.Location = this.editData.location;

    this.itemService.updateItem(itemToUpdate).subscribe({
        next: (res: any) => {
          this.showEditModal = false;
          
          // Change the ui for the user to see the updated data and that it's pending review
          this.auctionItem.Name = itemToUpdate.Name;
          this.auctionItem.StartPrice = itemToUpdate.StartPrice;
          this.auctionItem.CategoryId = itemToUpdate.CategoryId;
          const selectedCategory = this.categories.find(
            category => category.Id === itemToUpdate.CategoryId
          );

          if (selectedCategory) {
            this.auctionItem.Category = selectedCategory;
          }
          this.auctionItem.Description = itemToUpdate.Description;
          this.auctionItem.Location = itemToUpdate.Location;
          this.auctionItem.Status = 'Added' as any; // Reset status to pending
          this.auctionItem.CurrentPrice = itemToUpdate.StartPrice;
          this.bidAmount = itemToUpdate.StartPrice + 10;
          // Success Toast
          this.reportToastMessage = `Item updated and sent for Admin review!`;
          this.showReportToast = true;
          this.isReportToastHiding = false;

          if (this.reportToastTimeout) clearTimeout(this.reportToastTimeout);
          if (this.reportToastHideTimeout) clearTimeout(this.reportToastHideTimeout);

          this.reportToastHideTimeout = setTimeout(() => {
            this.isReportToastHiding = true;
            try { this.cdr.markForCheck(); } catch { }
          }, 1500);

          this.reportToastTimeout = setTimeout(() => {
            this.showReportToast = false;
            this.isReportToastHiding = false;
            try { this.cdr.markForCheck(); } catch { }
          }, 2000);

          try { this.cdr.markForCheck(); } catch { }
        },
        error: (err: any) => {
          console.error('Failed to edit item:', err);
          
          // Error Toast
          this.reportToastMessage =
                  err.error?.message ||
                  err.error ||
                  'Error updating item. Please try again.';
          this.showReportToast = true;
          this.isReportToastHiding = false;
          try { this.cdr.markForCheck(); } catch { }
        }
      });
  }



  isOwner(): boolean {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) return false;
    const ownerId =
      this.auctionItem.OwnerId ||
      (this.auctionItem.Owner as any)?.ID ||
      (this.auctionItem.Owner as any)?.id;
    return +ownerId === currentUserId;
  }

  
  // ================= NEW: Computed getters =================
  get isAuctionEnded(): boolean {
    if (!this.auctionItem) return false;
    if (this.auctionItem.Status === 'Sold' ||
        this.auctionItem.Status === 'NoWinner' ||
        this.auctionItem.Status === 'Rejected') {
      return true;
    }
    if (this.auctionItem.EndDate) {
      return new Date(this.auctionItem.EndDate) < new Date();
    }
    return false;
  }

  get isCurrentUserWinner(): boolean {
    if (!this.auctionItem || !this.auctionItem.WinnerId) return false;
    const currentUserId = this.authService.getCurrentUserId();
    return currentUserId ? this.auctionItem.WinnerId === currentUserId : false;
  }

  // ================= NEW: Debug method =================
  simulateAuctionEnd(): void {
    this.auctionItem.EndDate = new Date(Date.now() - 60000);
    this.auctionItem.Status = 'Sold';
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.auctionItem.WinnerId = userId;
    }
    try { this.cdr.detectChanges(); } catch { }
  }
}