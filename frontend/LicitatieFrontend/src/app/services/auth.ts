import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7137/api/User';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register`, userData)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(email: string, password: string): Observable<any> {
    // Trimitem un apel HTTP POST real către backend la ruta /api/User/login
    return this.http
      .post(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  private setSession(authResult: any): void {
    const expiresAt = new Date().getTime() + authResult.expiresIn * 1000;
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt));
  }

  logout(): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile_user');
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`http://localhost:5153/api/Profile/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
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
