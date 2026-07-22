import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { NotificationService } from '../../Models/notification/notification-service';
import { AppNotification } from '../../Models/notification/notification';

@Component({
  selector: 'app-notification-bell',
  standalone: false,
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBell implements OnInit, OnDestroy {
  notifications = signal<AppNotification[]>([]);
  hasUnread = signal(false);

  private pollTimer: any;

  constructor(private notifService: NotificationService) {}

  ngOnInit() {
    this.refresh();
    this.pollTimer = setInterval(() => this.refresh(), 30000); // 30 sec
  }

  ngOnDestroy() {
    clearInterval(this.pollTimer);
  }

  unreadCount = signal(0);

  refresh() {
    this.notifService.getUnreadCount().subscribe((v) => this.unreadCount.set(v));
  }

  open() {
    this.notifService.getMine().subscribe((n) => {
      this.notifications.set(n);
      const areUnread = n.some((item) => !item.isRead);
      if (areUnread) {
        this.notifService.markAllRead().subscribe(() => this.refresh());
      } else {
        this.unreadCount.set(0);
      }
    });
  }

  read(n: AppNotification) {
    this.notifService.markRead(n.id).subscribe(() => this.refresh());
  }
}
