import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-widget.html',
  styleUrls: ['./ai-widget.css'],
})
export class AiWidgetComponent {
  isChatOpen: boolean = false;
  userInput: string = '';

  messages: Array<{ text: string; isUser: boolean }> = [
    { text: 'Salut! Cu ce te pot ajuta pe BidSphere astăzi?', isUser: false },
  ];

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, isUser: true });
      this.userInput = '';

      setTimeout(() => {
        this.messages.push({
          text: 'Momentan sunt în faza de testare, dar te aud!',
          isUser: false,
        });
      }, 1000);
    }
  }
}
