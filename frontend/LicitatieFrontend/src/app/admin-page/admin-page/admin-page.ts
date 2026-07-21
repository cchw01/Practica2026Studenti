import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../Models/admin/admin-service';
import { AuthService } from '../../services/auth';

type Tab = 'stats' | 'users' | 'auctions' | 'forum' | 'tickets' | 'categories';

@Component({
  selector: 'app-admin-page',
  standalone: false,
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  activeTab: Tab = 'stats';

  stats: any = { totalUsers: 0, bannedUsers: 0, totalAuctions: 0 };
  users: any[] = [];
  pendingAuctions: any[] = [];
  forumPosts: any[] = [];
  forumComments: any[] = [];
  categories: any[] = [];
  userSearchTerm = '';
  userSortBy: 'name' | 'email' | 'reports' = 'name';
  filteredUsers: any[] = [];
  reportedUsers: any[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  adminName = '';
  adminInitials = '';
  usersView: 'all' | 'reported' = 'all';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const role = user?.role;
    if (!this.authService.isLoggedIn() || role !== 'Admin') {
      this.router.navigate(['/login-page']);
      return;
    }
    this.adminName = user?.name || 'Admin';
    this.adminInitials = this.adminName
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    this.loadStats();
    this.adminService.getPendingAuctions().subscribe((data) => {
      this.pendingAuctions = data || [];
      this.cdr.detectChanges();
    });
    this.adminService.getForumPosts().subscribe((data) => {
      this.forumPosts = data || [];
      this.cdr.detectChanges();
    });
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'stats') this.loadStats();
    if (tab === 'users') this.loadUsers();
    if (tab === 'auctions') this.loadAuctions();
    if (tab === 'forum') this.loadForum();
    if (tab === 'tickets') this.loadTickets();
    if (tab === 'categories') this.loadCategories();
  }

  // 3. METODA DE LOGOUT CORECTATĂ COMPLEMENTAR
  logout(): void {
    this.authService.logout(); // Aici apelăm logica colegilor tăi care curăță token-ul/starea din Header
    localStorage.removeItem('user_role'); // Curățăm și variabila noastră de control
    this.router.navigate(['/login-page']); // Te trimite la login-page ca utilizator complet deconectat
  }

  loadStats(): void {
    this.adminService.getStats().subscribe((data) => {
      this.stats = data || { totalUsers: 12, bannedUsers: 1, totalAuctions: 34 };
      this.cdr.detectChanges();
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe((data) => {
      this.users = data || [];
      this.applyUserFilters();
      this.cdr.detectChanges();
    });
  }

  loadAuctions(): void {
    this.adminService.getPendingAuctions().subscribe((data) => {
      this.pendingAuctions = data || [];
      this.cdr.detectChanges();
    });
  }

  loadForum(): void {
    this.adminService.getForumPosts().subscribe((data) => {
      this.forumPosts = data || [];
      this.cdr.detectChanges();
    });
  }

  loadTickets(): void {
    this.adminService.getSupportTickets().subscribe((data) => {
      this.forumComments = data || [];
      this.cdr.detectChanges();
    });
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe((data) => {
      this.categories = data || [];
      this.cdr.detectChanges();
    });
  }

  approveAuction(id: number): void {
    this.adminService.validateAuction(id).subscribe(() => this.loadAuctions());
  }

  rejectAuction(id: number): void {
    this.adminService.rejectAuction(id).subscribe(() => this.loadAuctions());
  }

  removeAuction(id: number): void {
    this.adminService.deleteAuction(id).subscribe(() => this.loadAuctions());
  }

  banUser(id: number): void {
    this.adminService.banUser(id).subscribe(() => this.loadUsers());
  }

  unbanUser(id: number): void {
    this.adminService.unbanUser(id).subscribe(() => this.loadUsers());
  }
  changeRole(userId: number, role: string): void {
    this.adminService.setRole(userId, role).subscribe(() => this.loadUsers());
  }

  removeUser(userId: number): void {
    if (!confirm('Ești sigur? Se șterge definitiv userul.')) return;
    this.adminService.deleteUser(userId).subscribe(() => this.loadUsers());
  }

  deletePost(id: number): void {
    this.adminService.deleteForumPost(id).subscribe(() => this.loadForum());
  }

  resolveTicket(id: number): void {
    this.adminService.resolveTicket(id).subscribe(() => this.loadTickets());
  }

  addCategory(name: string, desc: string): void {
    if (!name.trim()) return;
    this.adminService.addCategory(name, desc).subscribe(() => {
      this.loadCategories();
    });
  }

  applyUserFilters(): void {
    const term = this.userSearchTerm.trim().toLowerCase();

    let result = this.users.filter(
      (u) =>
        !term ||
        u.userName?.toLowerCase().includes(term) ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term),
    );

    result = this.sortUsers(result);

    this.filteredUsers = result;
    this.reportedUsers = result.filter((u) => (u.reports || 0) > 0);
  }

  private sortUsers(list: any[]): any[] {
    return [...list].sort((a, b) => {
      if (this.userSortBy === 'reports') {
        return (b.reports || 0) - (a.reports || 0);
      }
      const valA = (a[this.userSortBy] || '').toLowerCase();
      const valB = (b[this.userSortBy] || '').toLowerCase();
      return valA.localeCompare(valB);
    });
  }

  onUserSearchChange(): void {
    this.applyUserFilters();
  }

  onUserSortChange(): void {
    this.applyUserFilters();
  }
  get displayedUsers(): any[] {
    return this.usersView === 'all' ? this.filteredUsers : this.reportedUsers;
  }

  setUsersView(view: 'all' | 'reported'): void {
    this.usersView = view;
  }
}
