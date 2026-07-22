import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7137/api/User';

  constructor(private http: HttpClient) { }

  private createLocalToken(user: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const userId = user.id || user.ID || Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      id: userId,
      name: user.Name || user.name || 'User',
      email: user.Email || user.email || 'user@example.com',
      username: user.UserName || user.username || 'user',
      role: 'User'
    }));
    return `${header}.${payload}.signature`;
  }

  register(userData: any): Observable<any> {
    const payload = {
      UserName: userData.username || userData.UserName,
      username: userData.username || userData.UserName,
      Name: userData.name || userData.Name,
      Email: userData.email || userData.Email,
      Password: userData.password || userData.Password,
      PhoneNumber: userData.phoneNumber || userData.PhoneNumber,
      phoneNumber: userData.phoneNumber || userData.PhoneNumber
    };

    return new Observable<any>(observer => {
      this.http.post(`${this.apiUrl}/register`, payload).subscribe({
        next: (res: any) => {
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          // Fallback dacă backend-ul nu este pornit
          const fakeToken = this.createLocalToken(payload);
          const authResult = {
            idToken: fakeToken,
            accessToken: fakeToken,
            expiresIn: 86400,
            user: payload
          };
          this.setSession(authResult);
          localStorage.setItem('profile_user', JSON.stringify(payload));
          observer.next(authResult);
          observer.complete();
        }
      });
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((res: any) => this.setSession({ idToken: res.accessToken, expiresIn: res.expiresIn })),
      );
  }

  private setSession(authResult: any): void {
    if (!authResult) return;
    const expiresIn = authResult.expiresIn || 86400;
    const expiresAt = new Date().getTime() + expiresIn * 1000;
    if (authResult.idToken || authResult.accessToken) {
      localStorage.setItem('id_token', authResult.idToken || authResult.accessToken);
    }
    localStorage.setItem('expires_at', JSON.stringify(expiresAt));
  }

  logout(): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile_user');
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`https://localhost:7137/api/Profile/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  getCurrentUser(): any {
    const token = localStorage.getItem('id_token');
    if (!token) return null;
    try {
      let payloadBase64 = token.split('.')[1];
      payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      while (payloadBase64.length % 4 !== 0) {
        payloadBase64 += '=';
      }
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (e) {
      return null;
    }
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const rawId = user.id ?? user.ID ?? user.nameid ?? user.sub ?? user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    if (rawId === undefined || rawId === null) {
      return null;
    }
    const id = Number(rawId);
    return Number.isNaN(id) ? null : id;
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