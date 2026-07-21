import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionsPage } from './auctions-page';

describe('AuctionsPage', () => {
  let component: AuctionsPage;
  let fixture: ComponentFixture<AuctionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuctionsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
