import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserReadDto } from '../Models/user/userDto';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { ItemService } from '../services/item-service';
import { AuctionItem } from '../Models/item-model';

@Component({
  selector: 'app-user-page',
  standalone: false,
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
})
export class UserPage implements OnInit {
  userId!: number;
  user?: UserReadDto;

  // Liste pentru produse și categorii
  userActiveItems: AuctionItem[] = [];
  filteredUserItems: AuctionItem[] = [];
  userCategories: string[] = [];
  selectedCategory: string = '';

  showReportForm = false;
  reportReason = '';
  reportSuccessMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private itemService: ItemService,
    private cdr: ChangeDetectorRef // Injectăm ChangeDetectorRef pentru a forța redarea la F5
  ) {}

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
        
        // Forțăm Angular să verifice schimbările și să afișeze cardul de profil
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
    this.itemService.getActiveItems().subscribe({
      next: (items) => {
        console.log('DEBUG: Toate licitațiile active preluate:', items);
        
        // Filtrare licitații active ale acestui utilizator
        this.userActiveItems = items.filter(item => {
          const ownerId = item.OwnerId || (item as any).ownerId;
          const ownerObj = item.Owner || (item as any).owner;
          const ownerObjId = ownerObj ? (ownerObj.ID) : null;
          
          return +ownerId === this.userId || (ownerObjId !== null && +ownerObjId === this.userId);
        });

        console.log('DEBUG: Licitațiile filtrate pentru acest utilizator:', this.userActiveItems);

        // Extragem denumirile unice ale categoriilor
        const categoryNames = this.userActiveItems
          .map(item => item.Category?.name || (item.Category as any)?.Name)
          .filter((name): name is string => !!name);
          
        this.userCategories = [...new Set(categoryNames)];
        
        // La început, afișăm toate produsele utilizatorului
        this.applyCategoryFilter();

        // Forțăm Angular să redeseneze lista de produse
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('DEBUG: Eroare la determinarea categoriilor active:', err);
      }
    });
  }

  onCategoryChange(): void {
    this.applyCategoryFilter();
    this.cdr.detectChanges();
  }

  applyCategoryFilter(): void {
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

  // Metode raportare
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
}