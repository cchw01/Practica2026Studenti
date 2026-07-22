import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';

import { ProfileMenu } from './profile-menu';

describe('ProfileMenu', () => {
  let component: ProfileMenu;
  let fixture: ComponentFixture<ProfileMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileMenu],
      imports: [MatIconModule, MatMenuModule, TranslatePipe],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
