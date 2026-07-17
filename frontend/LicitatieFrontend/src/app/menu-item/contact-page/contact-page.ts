import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
})
export class ContactPage {
  contactEmail: string = 'contact@echipa5.ro';
  phoneNumber: string = '+40 123 456 789';
  callCenterSchedule = 'Monday–Friday, 9:00 AM–6:00 PM';;

  socialMediaLinks = [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
  ];
}
