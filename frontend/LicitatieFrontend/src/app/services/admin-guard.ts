import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    if (this.authService.isLoggedIn() && role === 'Admin') {
      return true;
    }
    this.router.navigate(['/home-page']);
    return false;
  }
}
