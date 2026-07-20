import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './help-page.html',
  styleUrls: ['./help-page.css'],
})
export class HelpPageComponent implements OnInit {
  helpForm!: FormGroup;

  // FAQ cu stare de deschis/închis
  faqs = [
    {
      question: 'Cum pot plasa o sumă la o licitație?',
      answer:
        'Navighează către pagina produsului dorit și introdu suma în câmpul "Bid now". Suma trebuie să fie mai mare decât prețul curent.',
      isOpen: false,
    },
    {
      question: 'Cum adaug un produs pentru a-l vinde?',
      answer:
        'Mergi în secțiunea "Profilul meu" și apasă butonul "Adaugă Licitație". Completează detaliile și așteaptă validarea unui Admin.',
      isOpen: false,
    },
    {
      question: 'Cum știu dacă am câștigat?',
      answer:
        'Vei primi o notificare pe email și în aplicație atunci când licitația se încheie și tu ai avut cea mai mare ofertă.',
      isOpen: false,
    },
  ];

  isChatOpen = false;
  isTyping = false; // Efect de scriere pentru AI
  chatMessages: { sender: string; text: string }[] = [
    { sender: 'ai', text: 'Salut! Sunt asistentul tău virtual. Cu ce te pot ajuta astăzi?' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.helpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      issue: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Deschide/închide o întrebare FAQ
  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  onSubmitHelpForm() {
    if (this.helpForm.valid) {
      alert('Tichetul tău a fost înregistrat cu succes! Te vom contacta în curând.');
      this.helpForm.reset();
    } else {
      alert('Te rugăm să completezi corect toate câmpurile.');
    }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage(inputEl: HTMLInputElement) {
    const text = inputEl.value.trim();
    if (text) {
      this.chatMessages.push({ sender: 'user', text });
      inputEl.value = '';
      this.isTyping = true;

      // Simulare răspuns inteligent cu întârziere
      setTimeout(() => {
        this.isTyping = false;
        this.chatMessages.push({
          sender: 'ai',
          text:
            'Am înțeles că ai o întrebare despre: "' +
            text +
            '". Te rog să consulți FAQ sau să folosești formularul pentru asistență umană!',
        });
      }, 1500);
    }
  }
}
