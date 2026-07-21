import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionItemPage } from './auction-item-page';

describe('AuctionItemPage', () => {
  let component: AuctionItemPage;
  let fixture: ComponentFixture<AuctionItemPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionItemPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionItemPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the auction title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Auction item');
  });
});
