import { Component, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { AuthService } from './services/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('BidSphere');
  protected readonly menuOpen = signal(false);
  protected readonly navHidden = signal(false);
  protected readonly isLoggedIn = signal(false);

  private lastScrollY = 0;

  private readonly onScroll = () => {
    if (this.menuOpen()) return;
    const currentY = window.scrollY;
    const shouldHide = currentY > this.lastScrollY && currentY > 120;
    if (shouldHide !== this.navHidden()) {
      this.zone.run(() => this.navHidden.set(shouldHide));
    }
    this.lastScrollY = currentY;
  };

  constructor(
    iconRegistry: MatIconRegistry,
    private zone: NgZone,
    private authService: AuthService,
    private router: Router,
  ) {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    // Apply saved theme on every page load
    const validThemes = ['light', 'sunset', 'ocean'];
    let savedTheme = localStorage.getItem('app_theme') || 'light';
    if (!validThemes.includes(savedTheme)) {
      savedTheme = 'light';
      localStorage.setItem('app_theme', 'light');
    }
    document.body.className = `theme-${savedTheme}`;
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.isLoggedIn.set(this.authService.isLoggedIn());
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => this.isLoggedIn.set(this.authService.isLoggedIn()));
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.router.navigate(['/home-page']);
  }
}
