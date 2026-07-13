import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {
  contactEmail: string = 'contact@echipa5.ro'; // schimbam cu mailul final
  phoneNumber: string = '+40 123 456 789';
  callCenterSchedule: string = 'Monday - Friday: 9am - 6pm';

  socialMediaLinks = [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
  ];
}
