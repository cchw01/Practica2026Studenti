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
  isChatOpen: boolean = false;

  // IATĂ CELE DOUĂ VARIABILE CARE LIPSESC ACUM ȘI CAUZEAZĂ EROAREA:
  listaMesaje: { expeditor: string, text: string }[] = [];
  seIncarca: boolean = false;

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  trimiteIntrebare() {
    if (!this.mesaj.trim()) return;

    const textIntrebare = this.mesaj;
    this.listaMesaje.push({ expeditor: 'user', text: textIntrebare });
    
    this.mesaj = '';
    this.seIncarca = true;

    this.http.post<any>('http://127.0.0.1:8000/api/chat', { text: textIntrebare }).subscribe({
      next: (data) => {
        this.listaMesaje.push({ expeditor: 'ai', text: data.raspuns });
        this.seIncarca = false;
      },
      error: (err) => {
        console.error('Eroare de la server:', err);
        this.listaMesaje.push({ expeditor: 'ai', text: 'Eroare de conectare la serverul AI.' });
        this.seIncarca = false;
      },
    });
  }
}