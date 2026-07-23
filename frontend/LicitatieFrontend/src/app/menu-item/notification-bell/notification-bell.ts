import { Component, OnDestroy, OnInit, signal } from '@angular/core';

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
  unreadCount = signal(0);

  doNotDisturb = signal(false);
  isLoading = signal(false);
  isMarkingAllRead = signal(false);

  private pollTimer?: ReturnType<typeof setInterval>;
  private timeRefreshTimer?: ReturnType<typeof setInterval>;
  private currentTime = signal(Date.now());
  private hiddenNotificationIds = new Set<number>();
  private readonly hiddenNotificationsKey = 'hiddenNotificationIds';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadHiddenNotificationIds();
    this.loadDoNotDisturbPreference();
    this.refreshUnreadCount();

    this.pollTimer = setInterval(() => {
      this.refreshUnreadCount();
    }, 30_000);

    this.timeRefreshTimer = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 60_000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    if (this.timeRefreshTimer) {
      clearInterval(this.timeRefreshTimer);
    }
  }

  open(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);

    this.notificationService.getMine().subscribe({
      next: (notifications) => {
        const visibleNotifications = notifications
          .filter((notification) => !this.hiddenNotificationIds.has(notification.id))
          .sort(
            (first, second) =>
              new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
          );

        this.notifications.set(visibleNotifications);
        this.updateUnreadCountFromList();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Could not load notifications:', error);
        this.isLoading.set(false);
      },
    });
  }

  refreshUnreadCount(): void {
    this.notificationService.getMine().subscribe({
      next: (notifications) => {
        const visibleUnreadCount = notifications.filter(
          (notification) =>
            !notification.isRead && !this.hiddenNotificationIds.has(notification.id),
        ).length;

        this.unreadCount.set(visibleUnreadCount);
      },
      error: (error) => {
        console.error('Could not load unread count:', error);
      },
    });
  }

  read(notification: AppNotification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markRead(notification.id).subscribe({
      next: () => {
        this.notifications.update((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item,
          ),
        );

        this.updateUnreadCountFromList();
      },
      error: (error) => {
        console.error('Could not mark notification as read:', error);
      },
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0 || this.isMarkingAllRead()) {
      return;
    }

    this.isMarkingAllRead.set(true);

    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.update((currentNotifications) =>
          currentNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          })),
        );

        this.unreadCount.set(0);
        this.isMarkingAllRead.set(false);
      },
      error: (error) => {
        console.error('Could not mark all notifications as read:', error);
        this.isMarkingAllRead.set(false);
      },
    });
  }

  hideNotification(notification: AppNotification): void {
    this.hiddenNotificationIds.add(notification.id);
    this.saveHiddenNotificationIds();

    this.notifications.update((currentNotifications) =>
      currentNotifications.filter((item) => item.id !== notification.id),
    );

    this.updateUnreadCountFromList();
  }

  toggleDoNotDisturb(enabled: boolean): void {
    this.doNotDisturb.set(enabled);

    localStorage.setItem('notificationsDoNotDisturb', String(enabled));
  }

  showUnreadIndicator(): boolean {
    return !this.doNotDisturb() && this.unreadCount() > 0;
  }

  displayUnreadCount(): string {
    const count = this.unreadCount();

    return count > 99 ? '99+' : String(count);
  }

  getRelativeTime(createdAt: string): string {
    const now = this.currentTime();
    const createdDate = new Date(createdAt);
    const createdTime = createdDate.getTime();

    if (Number.isNaN(createdTime)) {
      return '';
    }

    const differenceInMilliseconds = Math.max(0, now - createdTime);

    const seconds = Math.floor(differenceInMilliseconds / 1_000);

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'Now';
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} h ago`;
    }

    if (days === 1) {
      return 'Yesterday';
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return createdDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: createdDate.getFullYear() !== new Date(now).getFullYear() ? 'numeric' : undefined,
    });
  }

  trackByNotificationId(index: number, notification: AppNotification): number {
    return notification.id;
  }

  private updateUnreadCountFromList(): void {
    const count = this.notifications().filter((notification) => !notification.isRead).length;

    this.unreadCount.set(count);
  }

  private loadDoNotDisturbPreference(): void {
    const savedPreference = localStorage.getItem('notificationsDoNotDisturb');

    this.doNotDisturb.set(savedPreference === 'true');
  }

  private loadHiddenNotificationIds(): void {
    const savedIds = localStorage.getItem(this.hiddenNotificationsKey);

    if (!savedIds) {
      return;
    }

    try {
      const parsedIds: unknown = JSON.parse(savedIds);

      if (!Array.isArray(parsedIds)) {
        return;
      }

      this.hiddenNotificationIds = new Set(
        parsedIds.filter((id): id is number => typeof id === 'number'),
      );
    } catch (error) {
      console.error('Could not load hidden notification IDs:', error);

      localStorage.removeItem(this.hiddenNotificationsKey);
    }
  }

  private saveHiddenNotificationIds(): void {
    localStorage.setItem(
      this.hiddenNotificationsKey,
      JSON.stringify([...this.hiddenNotificationIds]),
    );
  }

  private parseStructured(n: AppNotification): { type: string; params: any } | null {
    try {
      const parsed = JSON.parse(n.message);
      return parsed?.type ? { type: parsed.type, params: parsed.params || {} } : null;
    } catch {
      return null; 
    }
  }
  getNotificationKey(n: AppNotification): string | null {
    const s = this.parseStructured(n);
    return s ? `NOTIFICATIONS.TYPES.${s.type}` : null;
  }

  getNotificationParams(n: AppNotification): Record<string, string> {
    return this.parseStructured(n)?.params ?? {};
  }
}
