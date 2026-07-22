import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { App } from './app';
import { Footer } from './app-logic/footer/footer';
import { NotificationBell } from './menu-item/notification-bell/notification-bell';
import { ProfileMenu } from './menu-item/profile-menu/profile-menu';
import { AiWidgetComponent } from './ai-widget/ai-widget';

describe('App', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      writable: true,
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        RouterModule,
        MatIconModule,
        TranslatePipe,
        AiWidgetComponent,
      ],
      declarations: [
        App,
        Footer,
        NotificationBell,
        ProfileMenu,
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('BidSphere');
  });
});
