import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../Models/admin/admin-service';

type Tab = 'stats' | 'users' | 'auctions';

@Component({
  selector: 'app-admin-page',
  standalone: false,
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage implements OnInit {
  activeTab: Tab = 'stats';

  stats: any = null;
  users: any[] = [];
  pendingAuctions: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'stats') this.loadStats();
    if (tab === 'users') this.loadUsers();
    if (tab === 'auctions') this.loadPendingAuctions();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe((s) => (this.stats = s));
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (u) => (this.users = u),
      error: (err) => console.error('Eroare la incarcarea userilor:', err),
    });
  }

  changeRole(userId: number, role: string): void {
    this.adminService.setRole(userId, role).subscribe(() => this.loadUsers());
  }

  toggleBan(user: any): void {
    const action = user.isBanned
      ? this.adminService.unbanUser(user.id)
      : this.adminService.banUser(user.id);
    action.subscribe(() => this.loadUsers());
  }

  removeUser(userId: number): void {
    if (!confirm('Ești sigur? Se șterge definitiv userul.')) return;
    this.adminService.deleteUser(userId).subscribe(() => this.loadUsers());
  }

  loadPendingAuctions(): void {
    this.adminService.getPendingAuctions().subscribe({
      next: (a) => (this.pendingAuctions = a),
      error: (err) => console.error('Eroare la incarcarea licitatiilor:', err),
    });
  }

  validate(id: number): void {
    this.adminService.validateAuction(id).subscribe(() => this.loadPendingAuctions());
  }

  reject(id: number): void {
    this.adminService.rejectAuction(id).subscribe(() => this.loadPendingAuctions());
  }

  removeAuction(id: number): void {
    if (!confirm('Ești sigur? Se șterge definitiv licitația.')) return;
    this.adminService.deleteAuction(id).subscribe(() => this.loadPendingAuctions());
  }
}
