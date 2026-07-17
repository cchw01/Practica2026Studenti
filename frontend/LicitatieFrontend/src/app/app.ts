import {
  Component,
  computed,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';

import { MatIconRegistry } from '@angular/material/icon';
<<<<<<< HEAD
import { TranslateService } from '@ngx-translate/core';

const SUPPORTED_LANGUAGES = ['en', 'ro', 'es'] as const;

type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
=======
import { AuthService } from './services/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
>>>>>>> 847390ef5cedc796872eb804373654a2a86bfd6a

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('BidSphere');
  protected readonly menuOpen = signal(false);
  protected readonly navHidden = signal(false);
  protected readonly isLoggedIn = signal(false);

  readonly translate = inject(TranslateService);
  readonly languages = SUPPORTED_LANGUAGES;

  protected readonly currentLanguage =
    signal<AppLanguage>('en');

  readonly currentLanguageLabel = computed(() =>
    this.currentLanguage().toUpperCase()
  );

  private lastScrollY = 0;

  private readonly onScroll = (): void => {
    if (this.menuOpen()) {
      return;
    }

    const currentY = window.scrollY;

    const shouldHide =
      currentY > this.lastScrollY &&
      currentY > 120;

    if (shouldHide !== this.navHidden()) {
      this.zone.run(() => {
        this.navHidden.set(shouldHide);
      });
    }

    this.lastScrollY = currentY;
  };

  constructor(
    iconRegistry: MatIconRegistry,
<<<<<<< HEAD
    private readonly zone: NgZone
  ) {
    iconRegistry.setDefaultFontSetClass(
      'material-symbols-outlined'
    );

    this.translate.addLangs([...this.languages]);

    const savedLanguage =
      localStorage.getItem('language');

    const browserLanguage =
      this.translate.getBrowserLang();

    let initialLanguage: AppLanguage = 'en';

    if (this.isSupportedLanguage(savedLanguage)) {
      initialLanguage = savedLanguage;
    } else if (
      this.isSupportedLanguage(browserLanguage)
    ) {
      initialLanguage = browserLanguage;
    }

    this.changeLanguage(initialLanguage);
=======
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
>>>>>>> 847390ef5cedc796872eb804373654a2a86bfd6a
  }

  ngOnInit(): void {
    this.lastScrollY = window.scrollY;

    this.zone.runOutsideAngular(() => {
<<<<<<< HEAD
      window.addEventListener(
        'scroll',
        this.onScroll,
        { passive: true }
      );
=======
      this.isLoggedIn.set(this.authService.isLoggedIn());
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe(() => this.isLoggedIn.set(this.authService.isLoggedIn()));
      window.addEventListener('scroll', this.onScroll, { passive: true });
>>>>>>> 847390ef5cedc796872eb804373654a2a86bfd6a
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'scroll',
      this.onScroll
    );
  }

  changeLanguage(language: AppLanguage): void {
    this.translate.use(language);
    this.currentLanguage.set(language);

    localStorage.setItem(
      'language',
      language
    );

    document.documentElement.lang = language;

    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);

    if (this.menuOpen()) {
      this.navHidden.set(false);
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
<<<<<<< HEAD

  private isSupportedLanguage(
    language: string | null | undefined
  ): language is AppLanguage {
    return (
      language != null &&
      this.languages.includes(
        language as AppLanguage
      )
    );
  }
}
=======
  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.router.navigate(['/home-page']);
  }
}
>>>>>>> 847390ef5cedc796872eb804373654a2a86bfd6a
