import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: false,
  templateUrl: './forgot-password-dialog.html',
  styleUrl: './forgot-password-dialog.css',
})
export class ForgotPasswordDialogComponent {
  email: string = '';
  isSubmitting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
    private authService: AuthService,
  ) {}

  sendResetLink(): void {
    if (this.email) {
      this.isSubmitting = true;
      console.log('Se trimite email către:', this.email);

      this.authService.forgotPassword(this.email).subscribe({
        next: (response) => {
          console.log('Email trimis cu succes!', response);
          this.dialogRef.close();
        },
        error: (err) => {
          console.error('Eroare la trimiterea emailului:', err);
          this.isSubmitting = false;
        },
      });
    }
  }
}
