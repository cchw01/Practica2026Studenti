import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategoryCreate, } from '../../Models/categoryItem';
import { AdminService } from '../../Models/admin/admin-service';
import { AuthService } from '../../services/auth';
import { CategoryService } from '../../services/category-service';

type Tab = | 'stats' | 'users' | 'auctions' | 'forum' | 'tickets' | 'categories';

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
  pendingAuctions: any[] = [];
  forumPosts: any[] = [];
  forumComments: any[] = [];
  categories: Category[] = [];

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
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    const role = currentUser?.role;

    if (!this.authService.isLoggedIn() || role !== 'Admin') {
      this.router.navigate(['/login-page']);
      return;
    }

    this.loadStats();
    this.loadAuctions();
    this.loadForum();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;

    switch (tab) {
      case 'stats': this.loadStats(); break;
      case 'users': this.loadUsers(); break;
      case 'auctions': this.loadAuctions(); break;
      case 'forum': this.loadForum(); break;
      case 'tickets': this.loadTickets(); break;
      case 'categories': this.loadCategories(); break;
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
      error: (error) => { console.error('Eroare la încărcarea statisticilor:', error);
      },
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Eroare la încărcarea utilizatorilor:', error);
      },
    });
  }

  loadAuctions(): void {
    this.adminService.getPendingAuctions().subscribe({
      next: (data) => {
        this.pendingAuctions = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Eroare la încărcarea licitațiilor:', error);
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
        console.error('Eroare la încărcarea forumului:', error);
      },
    });
  }

  loadTickets(): void {
    this.adminService.getSupportTickets().subscribe({
      next: (data) => {
        this.forumComments = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Eroare la încărcarea tichetelor:', error);
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
        console.error('Eroare la încărcarea categoriilor:', error);

        this.categories = [];
        this.categoryLoading = false;
        this.categoryErrorMessage =
        this.getCategoryErrorMessage(error, 'Categoriile nu au putut fi încărcate.');
        this.cdr.detectChanges();
      },
    });
  }

  approveAuction(id: number): void {
    this.adminService
      .validateAuction(id)
      .subscribe(() => this.loadAuctions());
  }

  rejectAuction(id: number): void {
    this.adminService
      .rejectAuction(id)
      .subscribe(() => this.loadAuctions());
  }

  removeAuction(id: number): void {
    this.adminService
      .deleteAuction(id)
      .subscribe(() => this.loadAuctions());
  }

  banUser(id: number): void {
    this.adminService
      .banUser(id)
      .subscribe(() => this.loadUsers());
  }

  unbanUser(id: number): void {
    this.adminService
      .unbanUser(id)
      .subscribe(() => this.loadUsers());
  }

  changeRole(userId: number, role: string): void {
    this.adminService
      .setRole(userId, role)
      .subscribe(() => this.loadUsers());
  }

  removeUser(userId: number): void {
    const confirmed = confirm('Ești sigur? Se șterge definitiv utilizatorul.');

    if (!confirmed) {
      return;
    }

    this.adminService
      .deleteUser(userId)
      .subscribe(() => this.loadUsers());
  }

  deletePost(id: number): void {
    this.adminService
      .deleteForumPost(id)
      .subscribe(() => this.loadForum());
  }

  resolveTicket(id: number): void {
    this.adminService
      .resolveTicket(id)
      .subscribe(() => this.loadTickets());
  }

  addCategory(
    nameInput: HTMLInputElement,
    descriptionInput: HTMLTextAreaElement,
  ): void {
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    this.categoryErrorMessage = '';

    if (!name) {
      this.categoryErrorMessage = 'Numele categoriei este obligatoriu.';
      return;
    }

    const category: CategoryCreate = {
      Name: name,
      Description: description,
    };

    this.categorySubmitting = true;

    this.categoryService.addCategory(category).subscribe({
      next: () => {
        nameInput.value = '';
        descriptionInput.value = '';
        this.categorySubmitting = false;

        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Eroare la crearea categoriei:', error);

        this.categorySubmitting = false;
        this.categoryErrorMessage =
        this.getCategoryErrorMessage(error, 'Categoria nu a putut fi creată.');
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
      this.categoryErrorMessage = 'Numele categoriei este obligatoriu.';
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
        console.error('Eroare la actualizarea categoriei:', error);

        this.categorySubmitting = false;
        this.categoryErrorMessage =
        this.getCategoryErrorMessage(error, 'Categoria nu a putut fi actualizată.');
        this.cdr.detectChanges();
      },
    });
  }

  removeCategory(category: Category): void {
    const confirmed = confirm( `Sigur vrei să ștergi categoria „${category.name}”?`);

    if (!confirmed) { return; }

    this.categoryErrorMessage = '';

    this.categoryService
      .deleteCategory(category.Id).subscribe({
        next: () => {
          if (this.editingCategoryId === category.Id) {
            this.cancelCategoryEdit();
          }

          this.loadCategories();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Eroare la ștergerea categoriei:', error);

          this.categoryErrorMessage =
          this.getCategoryErrorMessage(error, 'Categoria nu a putut fi ștearsă.');
          this.cdr.detectChanges();
        },
      });
  }

  private getCategoryErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string,
  ): string {
    if ( typeof error.error === 'string' && error.error.trim()) {
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
}