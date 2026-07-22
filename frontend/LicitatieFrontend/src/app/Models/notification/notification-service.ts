import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification } from './notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'https://localhost:7137/api/Notification';

  constructor(private http: HttpClient) { }

  getMine(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  hasUnread(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/has-unread`);
  }

  markRead(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/read`, {});
  }

  createTest(): Observable<any> {
    return this.http.post(`${this.apiUrl}/test`, {});
  }
  markAllRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/read-all`, {});
  }
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }
}
