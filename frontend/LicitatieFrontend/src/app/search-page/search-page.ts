import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ItemService } from '../services/item-service';
import { UserService } from '../services/user-service';
import { ForumPostService } from '../Models/forum-post/forum-post-service';
import { AuctionItem } from '../Models/item-model';
import { UserReadDto } from '../Models/user/userDto';
import { ForumPost } from '../Models/forum-post/forum-post';

type SearchTab = 'auctions' | 'users' | 'forum';

@Component({
  selector: 'app-search-page',
  standalone: false,
  templateUrl: './search-page.html',
  styleUrls: ['./search-page.scss'],
})
export class SearchPage implements OnInit {
  query = '';
  activeTab: SearchTab = 'auctions';

  private allItems: AuctionItem[] = [];
  private allUsers: UserReadDto[] = [];
  private allPosts: ForumPost[] = [];

  filteredItems: AuctionItem[] = [];
  filteredUsers: UserReadDto[] = [];
  filteredPosts: ForumPost[] = [];

  itemsLoaded = false;
  usersLoaded = false;
  postsLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private userService: UserService,
    private forumPostService: ForumPostService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      this.applyFilters();
      this.cdr.detectChanges();
    });

    this.itemService.getItems().subscribe({
      next: (items) => {
        this.allItems = items;
        this.itemsLoaded = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eroare la încărcarea licitațiilor', err);
        this.itemsLoaded = true;
        this.cdr.detectChanges();
      },
    });

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.usersLoaded = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eroare la încărcarea utilizatorilor', err);
        this.usersLoaded = true;
        this.cdr.detectChanges();
      },
    });

    this.forumPostService.getForumPosts().subscribe({
      next: (posts) => {
        this.allPosts = posts;
        this.postsLoaded = true;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Eroare la încărcarea postărilor de forum', err);
        this.postsLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  setTab(tab: SearchTab): void {
    this.activeTab = tab;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.query.trim().toLowerCase();

    this.filteredItems = !search
      ? this.allItems
      : this.allItems.filter((i) => i.Name?.toLowerCase().includes(search));

    this.filteredUsers = !search
      ? this.allUsers
      : this.allUsers.filter(
          (u) =>
            u.UserName?.toLowerCase().includes(search) ||
            u.Name?.toLowerCase().includes(search),
        );

    this.filteredPosts = !search
      ? this.allPosts
      : this.allPosts.filter(
          (p) =>
            p.title?.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search) ||
            p.userName?.toLowerCase().includes(search),
        );
  }

  goToAuctionDetail(item: AuctionItem): void {
    this.router.navigate(['/action-item-page'], { state: { auction: item } });
  }

  goToForumDetail(post: ForumPost): void {
    this.router.navigate(['/forum', post.id]);
  }

  getRemainingTime(endDate: Date): string {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    if (diff <= 0) return this.translate.instant('AUCTIONS_PAGE.TIME.ENDED');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  }

  getTimeUrgencyClass(endDate: Date): string {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    const hoursLeft = diff / (1000 * 60 * 60);

    if (hoursLeft <= 24) return 'time-urgent';
    if (hoursLeft <= 72) return 'time-medium';
    return 'time-safe';
  }

  getInitial(user: UserReadDto): string {
    return (user.Name || user.UserName || '?').charAt(0).toUpperCase();
  }

  getStars(rating: number): number[] {
    const rounded = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (i < rounded ? 1 : 0));
  }
}
