import { Component, signal, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';

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

  // Languages available in the application.
  readonly languages = ['en', 'ro', 'es'];

  constructor(iconRegistry: MatIconRegistry) {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    // Register the available languages.
    this.translate.addLangs(this.languages);

    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = this.translate.getBrowserLang();

    let initialLanguage = 'en';

    // First use the language previously selected by the user.
    if (
      savedLanguage !== null &&
      this.languages.includes(savedLanguage)
    ) {
      initialLanguage = savedLanguage;
    }
    // Otherwise, use the browser language if it is supported.
    else if (
      browserLanguage !== undefined &&
      this.languages.includes(browserLanguage)
    ) {
      initialLanguage = browserLanguage;
    }

    this.changeLanguage(initialLanguage);
  }

  changeLanguage(language: string): void {
    if (!this.languages.includes(language)) {
      return;
    }

    // Load and activate the selected JSON translation.
    this.translate.use(language);

    // Remember the selected language after refreshing.
    localStorage.setItem('language', language);

    // Update the language attribute of the HTML document.
    document.documentElement.lang = language;

    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}