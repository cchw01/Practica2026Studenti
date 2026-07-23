import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, convertToParamMap, RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuctionItemPage } from './auction-item-page';
import { ShareListingButton } from '../shared/share-listing-button/share-listing-button';

describe('AuctionItemPage', () => {
  let component: AuctionItemPage;
  let fixture: ComponentFixture<AuctionItemPage>;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionItemPage, ShareListingButton],
      imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
            },
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionItemPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the auction title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auction Detail');
  });
});
