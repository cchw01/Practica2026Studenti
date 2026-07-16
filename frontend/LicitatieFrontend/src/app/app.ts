import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { MatIconRegistry } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';

const SUPPORTED_LANGUAGES = ['en', 'ro', 'es'] as const;

type AppLanguage = typeof SUPPORTED_LANGUAGES[number];

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BidSphere');
  protected readonly menuOpen = signal(false);

  readonly translate = inject(TranslateService);

  readonly languages = SUPPORTED_LANGUAGES;

  readonly currentLanguageLabel = computed(() => {
    const language = this.translate.currentLang();

    return language
      ? language.toUpperCase()
      : 'EN';
  });

  constructor(iconRegistry: MatIconRegistry) {
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

  changeLanguage(language: AppLanguage): void {
    this.translate.use(language);

    localStorage.setItem(
      'language',
      language
    );

    document.documentElement.lang = language;

    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen.update(
      open => !open
    );
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  private isSupportedLanguage(
    language: string | null | undefined
  ): language is AppLanguage {
    return (
      language !== null &&
      language !== undefined &&
      this.languages.includes(
        language as AppLanguage
      )
    );
  }
}