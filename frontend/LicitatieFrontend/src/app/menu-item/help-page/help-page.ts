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
  isLoggedIn = false; // <-- Aici controlăm dacă e logat sau nu

  faqCategories = [
    {
      title: '🚨 Urgențe și Probleme la Licitare',
      faqs: [
        {
          question: 'Am tastat o sumă greșită (un zero în plus). Cum anulez?',
          answer:
            'Ofertele sunt angajamente ferme. Totuși, în cazul unor erori evidente de tastare ("fat-finger"), sunați de urgență la call center înainte de încheierea licitației pentru o posibilă anulare manuală.',
          isOpen: false,
        },
        {
          question: 'Am fost supralicitat în ultima secundă. Este sistemul trucat?',
          answer:
            'Nu. Aceasta este o tactică frecventă numită "sniping". Pentru a combate acest fenomen și a vă oferi timp de reacție, orice ofertă plasată pe final prelungește automat cronometrul cu câteva minute.',
          isOpen: false,
        },
        {
          question: 'Licitația se termină imediat, iar eu mi-am uitat parola!',
          answer:
            'Acționați rapid folosind funcția "Mi-am uitat parola" de la Login pentru un link instant pe email. Dacă întâmpinați dificultăți, sunați imediat la call center pentru asistență de urgență.',
          isOpen: false,
        },
      ],
    },
    {
      title: '💳 Plăți, Taxe și Garanții',
      faqs: [
        {
          question: 'De ce suma finală de plată este mai mare decât am licitat?',
          answer:
            "La prețul câștigător (hammer price) se pot adăuga taxe specifice: comisionul platformei (buyer's premium), TVA-ul aplicabil și costurile de ambalare. Acestea sunt detaliate pe pagina fiecărui produs.",
          isOpen: false,
        },
        {
          question: 'Nu am câștigat licitația, dar am bani blocați pe card. De ce?',
          answer:
            'Pentru a asigura validitatea ofertelor, reținem temporar o sumă drept garanție la prima dumneavoastră licitare. Această reținere se anulează automat în câteva zile lucrătoare după pierderea licitației.',
          isOpen: false,
        },
        {
          question: 'Ce se întâmplă dacă am câștigat, dar nu mai vreau să plătesc?',
          answer:
            'Refuzul onorării plății atrage penalizări stricte: pierderea garanției reținute pe card și suspendarea definitivă a contului dumneavoastră de utilizator.',
          isOpen: false,
        },
      ],
    },
    {
      title: '📦 Livrare și Dispute',
      faqs: [
        {
          question: 'Cât mă va costa transportul pentru obiectul câștigat?',
          answer:
            'Costurile variază foarte mult în funcție de volumul produsului și de curier. Vă recomandăm ferm să cereți o estimare de transport pe Forum sau direct vânzătorului ÎNAINTE de a plasa o ofertă.',
          isOpen: false,
        },
        {
          question: 'Produsul primit nu arată ca în poze sau are defecte. Ce fac?',
          answer:
            'Aveți la dispoziție un termen limitat de dispută de la recepție. Folosiți formularul "Deschide un Tichet", atașați dovezi, iar un agent va media rezolvarea problemei (retur sau compensare).',
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

  onSubmitHelpForm() {
    if (this.helpForm.valid) {
      alert('Tichetul tău a fost înregistrat cu succes! Te vom contacta în curând.');
      this.helpForm.reset();
    } else {
      alert('Te rugăm să completezi corect toate câmpurile.');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
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
        this.chatMessages.push({
          sender: 'ai',
          text:
            'Am înțeles că ai o întrebare legată de: "' +
            text +
            '". Te rog să consulți FAQ sau să deschizi un tichet!',
        });
      }, 1500);
    }
  }
}
