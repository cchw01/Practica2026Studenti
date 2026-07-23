import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-reset-password-page',
  standalone: false,
  templateUrl: './reset-password-page.html',
  styleUrl: './reset-password-page.scss'
})
export class ResetPasswordPage implements OnInit {

  form!: FormGroup;

  token = '';
  successMessage = '';
  errorMessage = '';

  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {

    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.form = this.fb.group(
  {
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],

    confirmPassword: [
      '',
      Validators.required
    ]
  },
  {
    validators: this.passwordMatchValidator
  }
);

  }

  submit(): void {

  console.log("1. Am intrat in submit");

  this.successMessage = '';
  this.errorMessage = '';

  if (this.form.invalid) {
    console.log("2. Formular invalid");
    return;
  }

  console.log("3. Inainte de request");

  this.userService.resetPassword(
    this.token,
    this.form.value.password
  ).subscribe({

    next: (response) => {

  console.log("4. SUCCESS", response);

  this.successMessage = response.message;

  this.form.reset();

  setTimeout(() => {
    this.router.navigate(['/login-page']);
  }, 2000);

},

    error: (err) => {
      console.log("5. ERROR", err);
      this.errorMessage = err.error;
    }

  });

}

  passwordMatchValidator(group: AbstractControl) {

  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return password === confirm
    ? null
    : { passwordMismatch: true };

}
}