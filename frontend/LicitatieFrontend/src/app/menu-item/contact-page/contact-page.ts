import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
})
export class ContactPage implements OnInit {
  contactEmail: string = 'contact@echipa5.ro';
  phoneNumber: string = '+40 123 456 789';
  callCenterSchedule = 'Monday–Friday, 9:00 AM–6:00 PM';

  socialMediaLinks = [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
  ];

  // issueTypes array has been removed – no longer needed

  contactForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      // issueType removed from form group
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.contactForm.get(controlName);
    return control !== null && control.hasError(errorName) && control.touched;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const formData = this.contactForm.value;

    // Frontend-only — logs data to console
    console.log('Contact form submitted:', formData);

    this.submitted = true;
    this.contactForm.reset();
  }

  sendAnother(): void {
    this.submitted = false;
  }
}