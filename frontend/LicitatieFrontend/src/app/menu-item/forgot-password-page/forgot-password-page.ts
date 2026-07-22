import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: false,
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss'
})
export class ForgotPasswordPage {

  forgotForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.forgotForm.get(controlName);

    return !!control &&
      control.hasError(errorName) &&
      control.touched;
  }

  sendEmail() {

    if (this.forgotForm.invalid) {

      this.forgotForm.markAllAsTouched();
      return;

    }

    this.successMessage = '';
    this.errorMessage = '';

    const email = this.forgotForm.value.email;

    this.userService.forgotPassword(email).subscribe({

      next: () => {

  this.successMessage =
    'If an account with this email exists, a reset link has been sent.';

  this.errorMessage = '';

  this.forgotForm.reset();

},
error: () => {

  this.errorMessage =
    'Something went wrong. Please try again later.';

}

    });

  }

}