import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-widget',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ai-widget.html',
  styleUrls: ['./ai-widget.css'],
})
export class AiWidgetComponent {
  mesaj: string = '';
  raspuns: string = '';
  isChatOpen: boolean = false;

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  trimiteIntrebare() {
    if (!this.mesaj.trim()) return;

    // Salvăm textul și afișăm mesajul de așteptare vizual
    const textDeTrimis = this.mesaj;
    this.raspuns = 'AI-ul se gândește... (poate dura câteva secunde) ⏳';
    this.mesaj = ''; // Golim căsuța instant

    this.http.post<any>('http://127.0.0.1:8000/api/chat', { text: textDeTrimis }).subscribe({
      next: (data) => {
        this.raspuns = data.raspuns;
      },
      error: (err) => {
        console.error('Eroare de la server:', err);
        this.raspuns = 'Eroare de conectare. Verifică consola browser-ului (F12).';
      },
    });
  }
}
