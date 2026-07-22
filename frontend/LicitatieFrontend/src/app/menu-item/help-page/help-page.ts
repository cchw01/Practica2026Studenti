import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './help-page.html',
  styleUrls: ['./help-page.css'],
})
export class HelpPageComponent implements OnInit {
  helpForm!: FormGroup;
  isLoggedIn = false; // Controlăm afișarea formularului vs. butoanele de oaspeți

  faqCategories = [
    {
      title: '🚨 Urgențe și Probleme la Licitare',
      faqs: [
        {
          question: 'Am tastat o sumă greșită. Cum anulez?',
          answer: 'Ofertele sunt angajamente ferme. Totuși, sunați la call center.',
          isOpen: false,
        },
        {
          question: 'Am fost supralicitat în ultima secundă.',
          answer: 'Orice ofertă plasată pe final prelungește automat cronometrul.',
          isOpen: false,
        },
      ],
    },
    {
      title: '💳 Plăți, Taxe și Garanții',
      faqs: [
        {
          question: 'De ce suma finală este mai mare?',
          answer: 'La prețul câștigător se adaugă comisionul platformei și TVA-ul aplicabil.',
          isOpen: false,
        },
      ],
    },
  ];

  isChatOpen = false;
  isTyping = false;
  chatMessages: { sender: string; text: string }[] = [
    { sender: 'ai', text: 'Salut! Sunt asistentul tău virtual. Cu ce te pot ajuta astăzi?' },
  ];

  // Am scos momentan authService și supportService ca să oprim erorile TS
  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.helpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      issueType: ['', Validators.required],
      issue: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  scrollToCategory(index: number) {
    const element = document.getElementById('cat-' + index);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleFaq(catIndex: number, faqIndex: number) {
    this.faqCategories[catIndex].faqs[faqIndex].isOpen =
      !this.faqCategories[catIndex].faqs[faqIndex].isOpen;
  }
  submitted = false;

  onSubmitHelpForm() {
    if (this.helpForm.valid) {
      alert('Tichetul tău a fost înregistrat cu succes!');
      this.helpForm.reset();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
    if (this.helpForm.invalid) {
      return;
    }

    this.submitError = '';
    const formData = this.helpForm.getRawValue();

    this.supportService
      .submit('Help', formData.name, formData.email, formData.issue, formData.issueType)
      .subscribe({
        next: () => {
          this.submitted = true;
          this.helpForm.reset({ name: formData.name, email: formData.email });
        },
        error: (err) => {
          console.error('Eroare la trimiterea ticketului:', err);
          this.submitError = 'Ticketul nu a putut fi trimis. Încearcă din nou.';
        },
      });
  }

  sendAnother(): void {
    this.submitted = false;
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

      setTimeout(() => {
        this.isTyping = false;
        this.chatMessages.push({ sender: 'ai', text: 'Te rog să consulți secțiunea FAQ!' });
      }, 1500);
    }
  }
}
