import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../Models/admin/admin-service';


type Tab = 'stats' | 'users' | 'auctions' | 'forum';

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
  forumPosts: any[] = [];
  forumComments: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  setTab(tab: Tab): void {
  this.activeTab = tab;
  if (tab === 'stats') this.loadStats();
  if (tab === 'users') this.loadUsers();
  if (tab === 'auctions') this.loadPendingAuctions();
  if (tab === 'forum') this.loadForum();
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
    const wasBanned = user.isBanned;
    user.isBanned = !wasBanned; // actualizare instanta, vizual

    const action = wasBanned
      ? this.adminService.unbanUser(user.id)
      : this.adminService.banUser(user.id);

    action.subscribe({
      error: () => {
        user.isBanned = wasBanned; // daca a esuat, revino la starea reala
        this.loadUsers();
      },
    });
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
    this.pendingAuctions = this.pendingAuctions.filter((a) => a.id !== id); // dispare instant
    this.adminService.validateAuction(id).subscribe({
      error: () => this.loadPendingAuctions(), // daca a esuat, reincarca lista reala
    });
  }

  reject(id: number): void {
    this.pendingAuctions = this.pendingAuctions.filter((a) => a.id !== id);
    this.adminService.rejectAuction(id).subscribe({
      error: () => this.loadPendingAuctions(),
    });
  }

  removeAuction(id: number): void {
    if (!confirm('Ești sigur? Se șterge definitiv licitația.')) return;
    this.adminService.deleteAuction(id).subscribe(() => this.loadPendingAuctions());
  }

  loadForum(): void {
  this.adminService.getForumPosts().subscribe({
    next: (p) => (this.forumPosts = p),
    error: (err) => console.error('Eroare la incarcarea postarilor:', err),
  });
  this.adminService.getForumComments().subscribe({
    next: (c) => (this.forumComments = c),
    error: (err) => console.error('Eroare la incarcarea comentariilor:', err),
  });
}

removePost(id: number): void {
  if (!confirm('Ești sigur? Se șterge definitiv postarea și toate comentariile ei.')) return;
  this.forumPosts = this.forumPosts.filter((p) => p.id !== id);
  this.adminService.deleteForumPost(id).subscribe({ error: () => this.loadForum() });
}

removeComment(id: number): void {
  if (!confirm('Ești sigur? Se șterge definitiv comentariul.')) return;
  this.forumComments = this.forumComments.filter((c) => c.id !== id);
}
}