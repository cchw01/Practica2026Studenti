import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <--- Asigură-te că ai importul acesta sus
import { HelpPageComponent } from './help-page';

describe('HelpPageComponent', () => {
  let component: HelpPageComponent;
  let fixture: ComponentFixture<HelpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpPageComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule, // <--- Și adaugă-l aici în lista de imports
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
