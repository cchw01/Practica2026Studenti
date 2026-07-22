import { Component, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { MatIconRegistry } from '@angular/material/icon';

import { AuthService } from './services/auth';

type SupportedLanguage =
  'en' | 'ro' | 'es' | 'it' | 'de' | 'fr' | 'pl' | 'sk' | 'sr' | 'tr' | 'uk' | 'el' | 'hu';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('BidSphere');
  protected readonly menuOpen = signal(false);
  protected readonly navHidden = signal(false);
  protected readonly isLoggedIn = signal(false);
  protected readonly isAdmin = signal(false);

  currentLanguage = signal<SupportedLanguage>('en');

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
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
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
    this.initializeLanguage();

    this.zone.runOutsideAngular(() => {
      this.isLoggedIn.set(this.authService.isLoggedIn());
      // NOU: calculeaza rolul de admin la incarcare
      this.isAdmin.set(this.authService.getCurrentUser()?.role === 'Admin');

      this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
        this.isLoggedIn.set(this.authService.isLoggedIn());

        this.isAdmin.set(this.authService.getCurrentUser()?.role === 'Admin');
      });

      window.addEventListener('scroll', this.onScroll, {
        passive: true,
      });
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

  changeLanguage(language: SupportedLanguage): void {
    this.currentLanguage.set(language);

    localStorage.setItem('language', language);

    this.translate.use(language);
    this.closeMenu();
    this.languageMenuOpen = false;
  }

  currentLanguageLabel(): string {
    return this.currentLanguage().toUpperCase();
  }

  isCurrentLanguage(language: SupportedLanguage): boolean {
    return this.currentLanguage() === language;
  }

  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('language');

    const language: SupportedLanguage =
      savedLanguage === 'ro' || savedLanguage === 'es' || savedLanguage === 'en'
        ? savedLanguage
        : 'en';

    this.currentLanguage.set(language);
    this.translate.use(language);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.profileMenuOpen = false;
    this.router.navigate(['/home-page']);
  }

  goToAddItem(): void {
    this.closeMenu();

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/add-item']);
    } else {
      this.router.navigate(['/login-page']);
    }
  }
  languageMenuOpen = false;

  languages: SupportedLanguage[] = [
    'en',
    'ro',
    'es',
    'it',
    'de',
    'fr',
    'pl',
    'sk',
    'sr',
    'tr',
    'uk',
    'el',
    'hu',
  ];
  profileMenuOpen = false;
}
