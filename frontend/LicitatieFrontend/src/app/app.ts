import { Component, signal } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('BidSphere');
  protected readonly menuOpen = signal(false);

  constructor(iconRegistry: MatIconRegistry) {
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

  toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
