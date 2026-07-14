import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bid } from './bid';

describe('Bid', () => {
  let component: Bid;
  let fixture: ComponentFixture<Bid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Bid],
    }).compileComponents();

    fixture = TestBed.createComponent(Bid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
