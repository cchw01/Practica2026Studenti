import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserReadDto } from '../Models/user/userDto';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { ItemService } from '../services/item-service';
import { AuthService } from '../services/auth';
import { ReviewService } from '../services/review-service';
import { AuctionItem } from '../Models/item-model';

@Component({
  selector: 'app-user-page',
  standalone: false,
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss',
})
export class UserPage implements OnInit {
  userId!: number;
  user?: UserReadDto;

  // Liste pentru produse și categorii
  userActiveItems: AuctionItem[] = [];
  filteredUserItems: AuctionItem[] = [];
  userCategories: string[] = [];
  selectedCategory: string = '';

  // Rapoarte
  showReportForm = false;
  reportReason = '';

  // Review-uri
  showReviewForm = false;
  reviewRating = 5;
  reviewComment = '';

  reportSuccessMessage = '';

  itemsLimit = 3;
  get displayedItems(): AuctionItem[] {
    return this.filteredUserItems.slice(0, this.itemsLimit);
  }

  showMoreItems(): void {
    this.itemsLimit += 6;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private itemService: ItemService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      console.log('DEBUG: ID Utilizator detectat în URL:', idParam);

      if (idParam) {
        this.userId = +idParam;
        this.loadUserProfile();
      }
    });
  }

  loadUserProfile(): void {
    console.log('DEBUG: Se inițiază cererea de profil pentru ID-ul:', this.userId);

    this.userService.getUser(this.userId).subscribe({
      next: (userData) => {
        console.log('DEBUG: Date utilizator primite de la backend:', userData);
        this.user = userData;
        this.loadUserActiveCategories();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('DEBUG: Eroare la încărcarea profilului utilizatorului:', err);
        alert('Nu s-au putut încărca datele acestui utilizator.');
        this.router.navigate(['/auctions']);
      }
    });
  }

  loadUserActiveCategories(): void {
    this.itemService.getItems().subscribe({
      next: (items) => {
        const username = this.user?.UserName || (this.user as any)?.userName || (this.user as any)?.username;
        this.userActiveItems = items.filter(item => {
          const ownerId = item.OwnerId || (item as any).ownerId;
          const ownerObj = item.Owner || (item as any).owner;
          const ownerObjId = ownerObj ? (ownerObj.ID || (ownerObj as any).id) : null;
          const ownerUsername = ownerObj?.UserName || (ownerObj as any)?.username || (item as any).ownerUserName;

          const matchId = +ownerId === this.userId || (ownerObjId !== null && +ownerObjId === this.userId);
          const matchUsername = username && ownerUsername && ownerUsername.toLowerCase() === username.toLowerCase();
          return matchId || matchUsername;
        });

        const categoryNames = this.userActiveItems
          .map(item => item.Category?.name || (item.Category as any)?.Name)
          .filter((name): name is string => !!name);

        this.userCategories = [...new Set(categoryNames)];
        this.applyCategoryFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('DEBUG: Eroare la determinarea categoriilor active:', err);
      }
    });
  }

  getItemImage(item: any): string {
    const rawUrl = item.ImageUrl || item.imageUrl || (item.PhotoList && item.PhotoList.length > 0 ? item.PhotoList[0] : null) || (item.photoList && item.photoList.length > 0 ? item.photoList[0] : null);
    if (rawUrl) {
      return this.itemService.formatImageUrl(rawUrl);
    }
    const title = (item.Name || item.name || '').toLowerCase();
    if (title.includes('watch')) {
      return 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop';
    }
    if (title.includes('bmw') || title.includes('car') || title.includes('leather')) {
      return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop';
    }
    return 'assets/images/placeholder.png';
  }

  onCategoryChange(): void {
    this.applyCategoryFilter();
    this.cdr.detectChanges();
  }

  applyCategoryFilter(): void {
    this.itemsLimit = 3;
    if (this.selectedCategory) {
      this.filteredUserItems = this.userActiveItems.filter(item => {
        const catName = item.Category?.name || (item.Category as any)?.Name;
        return catName === this.selectedCategory;
      });
    } else {
      this.filteredUserItems = [...this.userActiveItems];
    }
  }

  goToItemDetail(item: AuctionItem): void {
    this.router.navigate(['/action-item-page'], { state: { auction: item } });
  }

  // Metode Raportare
  openReportForm(): void {
    this.showReportForm = true;
    this.reportReason = '';
    this.cdr.detectChanges();
  }
  closeReportForm(): void {
    this.showReportForm = false;
    this.cdr.detectChanges();
  }
  submitReport(): void {
    if (!this.reportReason.trim()) return;
    this.userService.reportUser(this.userId, this.reportReason).subscribe({
      next: () => {
        this.showReportForm = false;
        this.reportSuccessMessage = `Utilizatorul a fost raportat cu succes pentru: "${this.reportReason}".`;
        this.reportReason = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('A apărut o eroare la trimiterea raportului.');
      }
    });
  }

  // Metode Review-uri
  openReviewForm(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      alert('Trebuie să fii autentificat pentru a lăsa un review.');
      return;
    }
    if (currentUserId === this.userId) {
      alert('Nu îți poți adăuga review propriei persoane.');
      return;
    }
    this.showReviewForm = true;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.cdr.detectChanges();
  }
  closeReviewForm(): void {
    this.showReviewForm = false;
    this.cdr.detectChanges();
  }
  submitReview(): void {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      alert('Trebuie să fii autentificat pentru a lăsa un review.');
      return;
    }
    if (!this.reviewComment.trim()) return;

    const reviewData = {
      ReviewerId: currentUserId,
      ReviewedUserId: this.userId,
      Rating: this.reviewRating,
      Comment: this.reviewComment
    };

    this.reviewService.addReview(reviewData).subscribe({
      next: () => {
        this.showReviewForm = false;
        this.reportSuccessMessage = `Review-ul tău de ${this.reviewRating} stele a fost trimis cu succes!`;
        this.reviewComment = '';
        // Reîncărcăm profilul pentru a vedea noul rating mediu calculat pe backend
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('DEBUG: Eroare la trimiterea review-ului:', err);
        alert('A apărut o eroare la salvarea review-ului pe backend.');
      }
    });
  }
}