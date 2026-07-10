import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../app-logic/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
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

    // Aici apelam metoda din serviciu catre backend
    this.authService.login(formData).subscribe({
      next: (response) => {
        console.log('Login cu succes!', response);
        // Mai incolo, aici vei pune logica de salvare token si redirect
      },
      error: (err) => {
        console.error('Eroare de la server:', err);
        // Aici poti prinde eroarea de la C# ca parola e gresita
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
