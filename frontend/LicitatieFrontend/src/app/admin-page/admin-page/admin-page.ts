import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategoryCreate } from '../../Models/categoryItem';
import { AdminService } from '../../Models/admin/admin-service';
import { AuthService } from '../../services/auth';
import { CategoryService } from '../../services/category-service';

type Tab = 'stats' | 'users' | 'auctions' | 'forum' | 'categories' | 'messages' | 'itemReports';

@Component({
  selector: 'app-admin-page',
  standalone: false,
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  activeTab: Tab = 'stats';

  stats: any = {
    totalUsers: 0,
    bannedUsers: 0,
    totalAuctions: 0,
  };

  users: any[] = [];
  userSearchTerm = '';
  userSortBy: 'name' | 'email' | 'reports' = 'name';
  filteredUsers: any[] = [];
  reportedUsers: any[] = [];

  contactMessages: any[] = [];
  helpMessages: any[] = [];
  messagesView: 'contact' | 'help' | 'history' = 'contact';
  historyFilter: 'all' | 'contact' | 'help' = 'all';
  messageSearchTerm = '';
  replyDrafts: { [id: number]: string } = {};

  pendingAuctions: any[] = [];
  forumPosts: any[] = [];
  forumComments: any[] = [];
  categories: Category[] = [];

  // Proprietăți pentru modalul de detalii rapoarte user
  showUserReportsModal = false;
  selectedUserForReports: any = null;
  selectedUserReports: any[] = [];

  // Proprietăți pentru tab-ul de Item Reports
  itemReports: any[] = [];
  itemReportsFilter: 'all' | 'pending' = 'pending';

  verifiedPostIds: Set<number> = new Set<number>();

  categoryLoading = false;
  categorySubmitting = false;
  categoryErrorMessage = '';

  editingCategoryId: number | null = null;
  editingCategoryName = '';
  editingCategoryDescription = '';

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    const saved = localStorage.getItem('verifiedForumPostIds');

    if (saved) {
      this.verifiedPostIds = new Set(JSON.parse(saved));
    }
  }

  adminName = '';
  adminInitials = '';
  adminId: number | null = null;
  usersView: 'all' | 'reported' = 'all';

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const role = user?.role;
    if (!this.authService.isLoggedIn() || role !== 'Admin') {
      this.router.navigate(['/login-page']);
      return;
    }
    this.adminName = user?.name || 'Admin';
    this.adminId = this.authService.getCurrentUserId();
    this.adminInitials = this.adminName
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    this.loadStats();
    this.loadAuctions();
    this.loadForum();
    this.loadMessages();
    this.loadItemReports();
  }

  get visibleForumPosts(): any[] {
    return this.forumPosts.filter((post) => !this.verifiedPostIds.has(post.id));
  }

  markAsVerified(id: number): void {
    this.verifiedPostIds.add(id);

    localStorage.setItem('verifiedForumPostIds', JSON.stringify([...this.verifiedPostIds]));
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;

    switch (tab) {
      case 'stats':
        this.loadStats();
        break;

      case 'users':
        this.loadUsers();
        break;

      case 'messages':
        this.loadMessages();
        break;

      case 'auctions':
        this.loadAuctions();
        break;

      case 'forum':
        this.loadForum();
        break;

      case 'categories':
        this.loadCategories();
        break;

      case 'itemReports':
        this.loadItemReports();
        break;
    }
  }

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('user_role');
    this.router.navigate(['/login-page']);
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data || {
          totalUsers: 0,
          bannedUsers: 0,
          totalAuctions: 0,
        };

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      },
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
    this.adminService.getPendingAuctions().subscribe({
      next: (data) => {
        this.pendingAuctions = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading auctions:', error);
      },
    });
  }

  loadForum(): void {
    this.adminService.getForumPosts().subscribe({
      next: (data) => {
        this.forumPosts = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading the forum:', error);
      },
    });
  }

  loadCategories(): void {
    this.categoryLoading = true;
    this.categoryErrorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.categoryLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading categories:', error);

        this.categories = [];
        this.categoryLoading = false;
        this.categoryErrorMessage = this.getCategoryErrorMessage(
          error,
          'The categories could not be loaded.',
        );
        this.cdr.detectChanges();
      },
    });
  }

  // Metode pentru modalul de detalii rapoarte user
  viewUserReports(user: any): void {
    this.selectedUserForReports = user;
    this.adminService.getReports().subscribe({
      next: (allReports) => {
        this.selectedUserReports = (allReports || []).filter(
          (r) => r.targetType === 'User' && r.targetId === user.id,
        );
        this.showUserReportsModal = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user reports:', error);
      },
    });
  }

  closeUserReportsModal(): void {
    this.showUserReportsModal = false;
    this.selectedUserForReports = null;
    this.selectedUserReports = [];
  }

  // Metode pentru tab-ul de Item Reports
  loadItemReports(): void {
    this.adminService.getReports().subscribe({
      next: (allReports) => {
        this.itemReports = (allReports || []).filter((r) => r.targetType === 'AuctionItem');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading item reports:', error);
      },
    });
  }

  get displayedItemReports(): any[] {
    if (this.itemReportsFilter === 'pending') {
      return this.itemReports.filter((r) => r.status === 'Pending');
    }
    return this.itemReports;
  }

  setItemReportsFilter(filter: 'all' | 'pending'): void {
    this.itemReportsFilter = filter;
  }

  dismissItemReport(id: number): void {
    this.adminService.updateReportStatus(id, 'Dismissed').subscribe(() => this.loadItemReports());
  }

  resolveItemReport(id: number): void {
    this.adminService.updateReportStatus(id, 'ActionTaken').subscribe(() => this.loadItemReports());
  }

  removeItemReport(id: number): void {
    const confirmed = confirm('Delete this report permanently?');
    if (!confirmed) return;
    this.adminService.deleteReport(id).subscribe(() => this.loadItemReports());
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
    if (id === this.adminId) {
      alert('You cannot ban your own account.');
      return;
    }
    this.adminService.banUser(id).subscribe(() => this.loadUsers());
  }

  unbanUser(id: number): void {
    this.adminService.unbanUser(id).subscribe(() => this.loadUsers());
  }

  changeRole(userId: number, role: string): void {
    this.adminService.setRole(userId, role).subscribe(() => this.loadUsers());
  }

  removeUser(userId: number): void {
    const confirmed = confirm('Are you sure? The user will be permanently deleted.');

    if (!confirmed) {
      return;
    }

    this.adminService.deleteUser(userId).subscribe(() => this.loadUsers());
  }

  deletePost(id: number): void {
    this.adminService.deleteForumPost(id).subscribe(() => this.loadForum());
  }

  addCategory(nameInput: HTMLInputElement, descriptionInput: HTMLTextAreaElement): void {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    this.categoryErrorMessage = '';

    if (!name) {
      this.categoryErrorMessage = 'The category name is required.';
      return;
    }

    const category: CategoryCreate = {
      Name: name,
      Description: description,
    };

    this.categorySubmitting = true;

    this.categoryService.addCategory(category).subscribe({
      next: (createdCategory) => {
        nameInput.value = '';
        descriptionInput.value = '';
        this.categorySubmitting = false;
        this.categoryErrorMessage = '';

        // Adaugam noua categorie direct in lista locala, imediat, fara sa astept raspunsul de la GET
        this.categories = [...this.categories, createdCategory].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        this.cdr.detectChanges();

        // Sincronizam si cu backend-ul, ca sa fim siguri ca lista e 100% la zi
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating the category:', error);

        this.categorySubmitting = false;
        this.categoryErrorMessage = this.getCategoryErrorMessage(
          error,
          'The category could not be created.',
        );
        this.cdr.detectChanges();
      },
    });
  }

  startCategoryEdit(category: Category): void {
    this.editingCategoryId = category.Id;
    this.editingCategoryName = category.name;
    this.editingCategoryDescription = category.description || '';
    this.categoryErrorMessage = '';
  }

  cancelCategoryEdit(): void {
    this.editingCategoryId = null;
    this.editingCategoryName = '';
    this.editingCategoryDescription = '';
    this.categoryErrorMessage = '';
  }

  saveCategoryEdit(): void {
    if (this.editingCategoryId === null) {
      return;
    }

    const name = this.editingCategoryName.trim();
    const description = this.editingCategoryDescription.trim();

    if (!name) {
      this.categoryErrorMessage = 'The category name is required.';
      return;
    }

    const category = new Category({
      Id: this.editingCategoryId,
      name,
      description,
    });

    this.categorySubmitting = true;
    this.categoryErrorMessage = '';

    this.categoryService.updateCategory(category).subscribe({
      next: () => {
        this.categorySubmitting = false;
        this.cancelCategoryEdit();
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating the category:', error);

        this.categorySubmitting = false;
        this.categoryErrorMessage = this.getCategoryErrorMessage(
          error,
          'The category could not be updated.',
        );
        this.cdr.detectChanges();
      },
    });
  }

  removeCategory(category: Category): void {
    const confirmed = confirm(`Are you sure you want to delete the "${category.name}" category?`);

    if (!confirmed) {
      return;
    }

    this.categoryErrorMessage = '';

    this.categoryService.deleteCategory(category.Id).subscribe({
      next: () => {
        if (this.editingCategoryId === category.Id) {
          this.cancelCategoryEdit();
        }

        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting the category:', error);

        this.categoryErrorMessage = this.getCategoryErrorMessage(
          error,
          'The category could not be deleted.',
        );
        this.cdr.detectChanges();
      },
    });
  }

  applyUserFilters(): void {
    const term = this.userSearchTerm.trim().toLowerCase();

    let result = this.users.filter(
      (user) =>
        !term ||
        user.userName?.toLowerCase().includes(term) ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term),
    );

    result = this.sortUsers(result);

    this.filteredUsers = result;
    this.reportedUsers = result.filter((user) => (user.reports || 0) > 0);
  }

  private sortUsers(list: any[]): any[] {
    return [...list].sort((a, b) => {
      if (this.userSortBy === 'reports') {
        return (b.reports || 0) - (a.reports || 0);
      }

      const valueA = String(a[this.userSortBy] || '').toLowerCase();
      const valueB = String(b[this.userSortBy] || '').toLowerCase();

      return valueA.localeCompare(valueB);
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
  get unresolvedMessagesCount(): number {
    const unresolvedContact = this.contactMessages.filter((m) => !m.isResolved).length;
    const unresolvedHelp = this.helpMessages.filter((m) => !m.isResolved).length;
    return unresolvedContact + unresolvedHelp;
  }

  setUsersView(view: 'all' | 'reported'): void {
    this.usersView = view;
  }

  private getCategoryErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (typeof error.error?.message === 'string' && error.error.message.trim()) {
      return error.error.message;
    }

    if (error.error?.errors) {
      const messages = Object.values(error.error.errors).flat();

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    return fallbackMessage;
  }

  setMessagesView(view: 'contact' | 'help' | 'history'): void {
    this.messagesView = view;
  }

  setHistoryFilter(filter: 'all' | 'contact' | 'help'): void {
    this.historyFilter = filter;
  }

  get unresolvedContactMessages(): any[] {
    return this.contactMessages.filter((m) => !m.isResolved);
  }

  get unresolvedHelpMessages(): any[] {
    return this.helpMessages.filter((m) => !m.isResolved);
  }

  get resolvedMessagesCount(): number {
    const resolvedContact = this.contactMessages.filter((m) => m.isResolved).length;
    const resolvedHelp = this.helpMessages.filter((m) => m.isResolved).length;
    return resolvedContact + resolvedHelp;
  }

  get displayedMessages(): any[] {
    let source: any[];

    if (this.messagesView === 'contact') {
      source = this.unresolvedContactMessages;
    } else if (this.messagesView === 'help') {
      source = this.unresolvedHelpMessages;
    } else {
      const resolvedContact = this.contactMessages.filter((m) => m.isResolved);
      const resolvedHelp = this.helpMessages.filter((m) => m.isResolved);

      if (this.historyFilter === 'contact') {
        source = resolvedContact;
      } else if (this.historyFilter === 'help') {
        source = resolvedHelp;
      } else {
        source = [...resolvedContact, ...resolvedHelp];
      }
    }

    const term = this.messageSearchTerm.trim().toLowerCase();

    if (!term) {
      return source;
    }

    return source.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.message?.toLowerCase().includes(term) ||
        m.issueType?.toLowerCase().includes(term),
    );
  }

  loadMessages(): void {
    this.adminService.getContactMessages().subscribe((data) => {
      this.contactMessages = data || [];
      this.cdr.detectChanges();
    });

    this.adminService.getHelpMessages().subscribe((data) => {
      this.helpMessages = data || [];
      this.cdr.detectChanges();
    });
  }

  resolveMessage(msg: any): void {
    const reply = this.replyDrafts[msg.id] || '';
    this.adminService.resolveMessage(msg.id, reply).subscribe({
      next: () => {
        delete this.replyDrafts[msg.id];
        this.loadMessages();
      },
      error: (err) => console.error('Eroare la rezolvarea mesajului:', err),
    });
  }
  deleteMessage(id: number): void {
    const confirmed = confirm('Ștergi definitiv acest mesaj?');
    if (!confirmed) {
      return;
    }
    this.adminService.deleteMessage(id).subscribe(() => this.loadMessages());
  }
  onCategoryFieldChange(): void {
    // gol intentionat — doar ca sa oblige Angular sa reevalueze [disabled] la fiecare litera tastata
  }
}
