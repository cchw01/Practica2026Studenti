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
  isChatOpen: boolean = false; // <-- Fereastra este ascunsă la început

  constructor(private http: HttpClient) {}

  // Funcția care deschide/închide fereastra
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  trimiteIntrebare() {
    if (!this.mesaj.trim()) return;

    this.http.post<any>('http://127.0.0.1:8000/api/chat', { text: this.mesaj }).subscribe({
      next: (data) => {
        this.raspuns = data.raspuns;
      },
      error: (err) => {
        console.error('Eroare de la server:', err);
        this.raspuns = 'Eroare de conectare la serverul AI.';
      },
    });
  }
}
