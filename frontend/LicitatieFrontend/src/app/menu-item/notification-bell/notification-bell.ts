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

  refresh() {
    this.notifService.hasUnread().subscribe((v) => this.hasUnread.set(v));
  }

  open() {
    this.notifService.getMine().subscribe((n) => {
      this.notifications.set(n);
      const areUnread = n.some((item) => !item.isRead);
      if (areUnread) {
        this.notifService.markAllRead().subscribe(() => this.refresh());
      } else {
        this.hasUnread.set(false);
      }
    });
  }

  read(n: AppNotification) {
    this.notifService.markRead(n.id).subscribe(() => this.refresh());
  }
}
