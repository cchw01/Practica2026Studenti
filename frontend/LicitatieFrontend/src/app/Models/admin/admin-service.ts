import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private adminUrl = 'https://localhost:7137/api/Admin';
  private userUrl = 'https://localhost:7137/api/User';
  private itemUrl = 'https://localhost:7137/api/AuctionItem';
  private forumPostUrl = 'https://localhost:7137/api/ForumPost';
  private forumCommentUrl = 'https://localhost:7137/api/ForumComment';
  private supportUrl = 'https://localhost:7137/api/SupportMessage';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.adminUrl}/stats`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/users`);
  }

  setRole(userId: number, role: string): Observable<any> {
    return this.http.post(`${this.adminUrl}/users/${userId}/role`, JSON.stringify(role), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(`${this.adminUrl}/users/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.adminUrl}/users/${userId}/unban`, {});
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.userUrl}/${userId}`);
  }

  getPendingAuctions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/auctions/pending`);
  }

  validateAuction(id: number): Observable<any> {
    return this.http.post(`${this.adminUrl}/auctions/${id}/validate`, {});
  }

  rejectAuction(id: number): Observable<any> {
    return this.http.post(`${this.adminUrl}/auctions/${id}/reject`, {});
  }

  deleteAuction(id: number): Observable<any> {
    return this.http.delete(`${this.itemUrl}/${id}`);
  }

  getForumPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.forumPostUrl);
  }

  deleteForumPost(id: number): Observable<any> {
    return this.http.delete(`${this.forumPostUrl}/${id}`);
  }

  getForumComments(): Observable<any[]> {
    return this.http.get<any[]>(this.forumCommentUrl);
  }

  deleteForumComment(id: number): Observable<any> {
    return this.http.delete(`${this.forumCommentUrl}/${id}`);
  }

  getContactMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.supportUrl}/contact`);
  }
  getHelpMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.supportUrl}/help`);
  }
  resolveMessage(id: number, replyMessage?: string): Observable<any> {
    return this.http.post(`${this.supportUrl}/${id}/resolve`, { replyMessage });
  }
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.supportUrl}/${id}`);
  }
}
