import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-menu',
  standalone: false,
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenu {
  @Output() loggedOut = new EventEmitter<void>();

  constructor(private router: Router) {}

  goToProfile() {
    this.router.navigate(['/profile-page']);
  }

  onLogout() {
    this.loggedOut.emit();
  }
}
