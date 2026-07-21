import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; // 1. Importul pentru ferestrele de tip pop-up
import { ForgotPasswordDialogComponent } from '../../forgot-password-dialog/forgot-password-dialog'; // 2. Importul componentei tale de pop-up

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog, // 3. Am injectat MatDialog aici
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control !== null && control.hasError(errorName) && control.touched;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formData = this.loginForm.value;
    console.log('Trimitem datele:', formData);

    this.authService.login(formData.email, formData.password).subscribe({
      next: (response: any) => {
        console.log('Login cu succes!', response);
        this.router.navigate(['/profile-page']);
      },
      error: (err) => {
        console.error('Eroare de la server:', err);
        this.errorMessage = err.error || 'Email sau parolă incorecte.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register-page']);
  }

  // 4. Metoda care se activează la click pe butonul de "Reset here" din HTML
  openForgotPasswordDialog(): void {
    this.dialog.open(ForgotPasswordDialogComponent, {
      width: '450px',
      disableClose: false,
      autoFocus: true,
    });
  }
}
