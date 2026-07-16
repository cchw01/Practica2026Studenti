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
import { TranslateService } from '@ngx-translate/core';

const SUPPORTED_LANGUAGES = ['en', 'ro', 'es'] as const;

type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

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
  }

  ngOnInit(): void {
    this.lastScrollY = window.scrollY;

    this.zone.runOutsideAngular(() => {
      window.addEventListener(
        'scroll',
        this.onScroll,
        { passive: true }
      );
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