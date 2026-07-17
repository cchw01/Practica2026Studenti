import { Component, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

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

  constructor(iconRegistry: MatIconRegistry, private zone: NgZone) {
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
}
