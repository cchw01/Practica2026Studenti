import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AiWidgetComponent } from './ai-widget';

describe('AiWidgetComponent', () => {
  let component: AiWidgetComponent;
  let fixture: ComponentFixture<AiWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiWidgetComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AiWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
