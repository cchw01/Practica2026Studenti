import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../Models/admin/admin-service';
import { AuthService } from '../../services/auth'; // 1. Importăm serviciul vostru de autentificare

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

  constructor(
    private adminService: AdminService,
    private authService: AuthService, // 2. Injectăm serviciul de autentificare al proiectului
    private router: Router
  ) {}

  ngOnInit(): void {
    const userRole = localStorage.getItem('user_role') || 'admin'; 

    if (userRole !== 'admin') {
      this.router.navigate(['/login-page']);
      return;
    }

    this.loadStats();
    this.adminService.getPendingAuctions().subscribe(data => this.pendingAuctions = data || []);
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
    this.adminService.getStats().subscribe(data => this.stats = data || { totalUsers: 12, bannedUsers: 1, totalAuctions: 34 });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe(data => this.users = data || []);
  }

  loadAuctions(): void {
    this.adminService.getPendingAuctions().subscribe(data => this.pendingAuctions = data || []);
  }

  loadForum(): void {
    this.adminService.getForumPosts().subscribe(data => this.forumPosts = data || []);
  }

  loadTickets(): void {
    this.adminService.getSupportTickets().subscribe(data => this.forumComments = data || []);
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe(data => this.categories = data || []);
  }

  approveAuction(id: number): void {
    this.adminService.validateAuction(id).subscribe(() => this.loadAuctions());
  }

  rejectAuction(id: number): void {
    this.adminService.rejectAuction(id).subscribe(() => this.loadAuctions());
  }

  banUser(id: number): void {
    this.adminService.banUser(id).subscribe(() => this.loadUsers());
  }

  unbanUser(id: number): void {
    this.adminService.unbanUser(id).subscribe(() => this.loadUsers());
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
}