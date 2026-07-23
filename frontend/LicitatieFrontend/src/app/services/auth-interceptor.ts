import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient,
  HttpBackend,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

const REFRESH_URL = 'https://localhost:7137/api/User/regenerate-token';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private rawHttp: HttpClient;

  constructor(private httpBackend: HttpBackend, private router: Router) {
    this.rawHttp = new HttpClient(this.httpBackend);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem('id_token');
    const authReq = idToken
      ? req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + idToken) })
      : req;

    return next.handle(authReq).pipe(
      catchError((error) => {
        const isAuthRelated =
          req.url.includes('/login') ||
          req.url.includes('/register') ||
          req.url.includes('regenerate-token');

        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRelated) {
          return this.handle401(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.rawHttp
        .post<{ accessToken: string; expiresIn: number }>(
          REFRESH_URL,
          {},
          { withCredentials: true }
        )
        .pipe(
          switchMap((res) => {
            this.isRefreshing = false;
            const expiresAt = new Date().getTime() + (res.expiresIn || 900) * 1000;
            localStorage.setItem('id_token', res.accessToken);
            localStorage.setItem('expires_at', JSON.stringify(expiresAt));
            this.refreshTokenSubject.next(res.accessToken);

            const retried = req.clone({
              headers: req.headers.set('Authorization', 'Bearer ' + res.accessToken),
            });
            return next.handle(retried);
          }),
          catchError((refreshErr) => {
            this.isRefreshing = false;
            localStorage.removeItem('id_token');
            localStorage.removeItem('expires_at');
            this.router.navigate(['/login-page']);
            return throwError(() => refreshErr);
          })
        );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const retried = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + token!),
        });
        return next.handle(retried);
      })
    );
  }
}