import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './help-page.html',
  styleUrls: ['./help-page.css'],
})
export class HelpPageComponent implements OnInit {
  helpForm!: FormGroup;

  // FAQ bazat pe probleme reale și frecvente la call center
  faqs = [
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
      question: 'De ce suma finală de plată este mai mare decât am licitat?',
      answer:
        "La prețul câștigător (hammer price) se pot adăuga taxe specifice: comisionul platformei (buyer's premium), TVA-ul aplicabil și costurile de ambalare/livrare. Acestea sunt detaliate pe pagina fiecărui produs.",
      isOpen: false,
    },
    {
      question: 'Nu am câștigat licitația, dar am bani blocați pe card. De ce?',
      answer:
        'Pentru a asigura validitatea ofertelor, reținem temporar o sumă drept garanție la prima dumneavoastră licitare. Această reținere se anulează automat în câteva zile lucrătoare după pierderea licitației.',
      isOpen: false,
    },
    {
      question: 'Cât mă va costa transportul pentru obiectul câștigat?',
      answer:
        'Costurile variază foarte mult în funcție de volumul produsului și de curier. Vă recomandăm ferm să cereți o estimare de transport pe Forum sau direct vânzătorului ÎNAINTE de a plasa o ofertă.',
      isOpen: false,
    },
    {
      question: 'Ce se întâmplă dacă am câștigat, dar nu mai vreau să plătesc?',
      answer:
        'Refuzul onorării plății este o încălcare a regulamentului. Acesta atrage penalizări stricte: pierderea garanției reținute pe card și suspendarea definitivă a contului dumneavoastră de utilizator.',
      isOpen: false,
    },
    {
      question: 'Produsul primit nu arată ca în poze sau are defecte ascunse. Ce fac?',
      answer:
        'Aveți la dispoziție un termen limitat de dispută de la recepție. Folosiți formularul de pe această pagină ("Deschide un Tichet"), atașați dovezi, iar un agent va media rezolvarea problemei (retur sau compensare).',
      isOpen: false,
    },
    {
      question: 'Licitația se termină imediat, iar mie mi-a expirat sesiunea și am uitat parola!',
      answer:
        'Acționați rapid folosind funcția "Mi-am uitat parola" de la Login pentru un link instant pe email. Dacă întâmpinați dificultăți de accesare a emailului, sunați imediat la call center pentru asistență de urgență.',
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
