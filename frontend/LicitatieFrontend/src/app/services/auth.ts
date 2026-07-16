import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(email: string, password: string): Observable<any> {

    const fakeResponse = {
      idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhY2NvdW50IiwiaXNzIjoiQXVjdGlvbkFwcCIsImV4cCI6MTc4NDAxOTY4MCwiaWQiOiIzIiwiZW1haWwiOiJzdHJpbmcyIiwibmFtZSI6InN0cmluZzIiLCJ1c2VybmFtZSI6InN0cmluZzIiLCJyb2xlIjoiVXNlciIsImlhdCI6MTc4NDAxNzg4MCwibmJmIjoxNzg0MDE3ODgwfQ.kuwa9eEmXqGVPrl-1NRXc-4xva--XpC-p3n31Y6S9Cw',
      expiresIn: 3600
    };

    return of(fakeResponse).pipe(
      tap(res => this.setSession(res))
    );

  }

  private setSession(authResult: any): void {
    const expiresAt = new Date().getTime() + (authResult.expiresIn * 1000);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt));
  }

  logout(): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile_user');
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`http://localhost:5153/api/Profile/${userId}/change-password`, { currentPassword, newPassword });
  }

  getCurrentUser(): any {
    const token = localStorage.getItem('id_token');
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (e) {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    return new Date().getTime() < this.getExpiration();
  }

  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  getExpiration(): number {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration || '0');
    return expiresAt;
  }
}