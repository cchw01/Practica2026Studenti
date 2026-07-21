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

  // Dropdown options for "Type of Issue". Each entry's translationKey
  // resolves against the CONTACT namespace in the i18n JSON files.
  issueTypes = [
    { value: 'general', translationKey: 'CONTACT.FORM_ISSUE_OPTION_GENERAL' },
    { value: 'technical', translationKey: 'CONTACT.FORM_ISSUE_OPTION_TECHNICAL' },
    { value: 'billing', translationKey: 'CONTACT.FORM_ISSUE_OPTION_BILLING' },
    { value: 'listing', translationKey: 'CONTACT.FORM_ISSUE_OPTION_LISTING' },
    { value: 'account', translationKey: 'CONTACT.FORM_ISSUE_OPTION_ACCOUNT' },
    { value: 'other', translationKey: 'CONTACT.FORM_ISSUE_OPTION_OTHER' },
  ];

  contactForm!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      issueType: ['', [Validators.required]],
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

    // Frontend-only for now — no backend endpoint wired up yet.
    // When one exists, replace this block with an HTTP call, e.g.:
    //   this.contactService.submit(formData).subscribe(...)
    console.log('Contact form submitted:', formData);

    this.submitted = true;
    this.contactForm.reset();
  }

  sendAnother(): void {
    this.submitted = false;
  }
}