import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SupportMessageService } from '../../services/support-message-service';
import { AuthService } from '../../services/auth';

interface Faq {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface FaqCategory {
  title: string;
  faqs: Faq[];
}

@Component({
  selector: 'app-help-page',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './help-page.html',
  styleUrls: ['./help-page.scss'],
})
export class HelpPageComponent implements OnInit {
  helpForm!: FormGroup;
  isLoggedIn = false;

  faqCategories: FaqCategory[] = [
  {
    title: 'HELP.FAQ_CATEGORIES.AUCTIONS.TITLE',
    faqs: [
      {
        question: 'HELP.FAQ_CATEGORIES.AUCTIONS.QUESTIONS.PLACE_BID.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.AUCTIONS.QUESTIONS.PLACE_BID.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.AUCTIONS.QUESTIONS.CANCEL_BID.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.AUCTIONS.QUESTIONS.CANCEL_BID.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.AUCTIONS.QUESTIONS.WIN_AUCTION.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.AUCTIONS.QUESTIONS.WIN_AUCTION.ANSWER',
        isOpen: false,
      },
    ],
  },
  {
    title: 'HELP.FAQ_CATEGORIES.ACCOUNT.TITLE',
    faqs: [
      {
        question: 'HELP.FAQ_CATEGORIES.ACCOUNT.QUESTIONS.CREATE_ACCOUNT.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.ACCOUNT.QUESTIONS.CREATE_ACCOUNT.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.ACCOUNT.QUESTIONS.FORGOT_PASSWORD.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.ACCOUNT.QUESTIONS.FORGOT_PASSWORD.ANSWER',
        isOpen: false,
      },
    ],
  },
  {
    title: 'HELP.FAQ_CATEGORIES.DELIVERY.TITLE',
    faqs: [
      {
        question: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.ITEM_DELIVERY.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.ITEM_DELIVERY.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.NOT_DELIVERED.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.NOT_DELIVERED.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.SHIPPING_COST.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.SHIPPING_COST.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.PAYOUT.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.DELIVERY.QUESTIONS.PAYOUT.ANSWER',
        isOpen: false,
      },
    ],
  },
  {
    title: 'HELP.FAQ_CATEGORIES.SELLING.TITLE',
    faqs: [
      {
        question: 'HELP.FAQ_CATEGORIES.SELLING.QUESTIONS.LIST_ITEM.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.SELLING.QUESTIONS.LIST_ITEM.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.SELLING.QUESTIONS.EDIT_AUCTION.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.SELLING.QUESTIONS.EDIT_AUCTION.ANSWER',
        isOpen: false,
      },
      {
        question: 'HELP.FAQ_CATEGORIES.SELLING.QUESTIONS.NOT_SOLD.QUESTION',
        answer: 'HELP.FAQ_CATEGORIES.SELLING.QUESTIONS.NOT_SOLD.ANSWER',
        isOpen: false,
      },
    ],
  },
];
  isChatOpen = false;
  isTyping = false;
  chatMessages: { sender: string; text: string }[] = [
    { sender: 'ai', text: "Hi! I'm your virtual assistant. How can I help you today?" },
  ];

  submitError = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private supportService: SupportMessageService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = this.authService.isLoggedIn();

    this.helpForm = this.fb.group({
      name: [currentUser?.name || '', Validators.required],
      email: [
        { value: currentUser?.email || '', disabled: !!currentUser },
        [Validators.required, Validators.email],
      ],
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

  goToLogin() {
    this.router.navigate(['/login-page']);
  }

  goToRegister() {
    this.router.navigate(['/register-page']);
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
            'I understand you have a question about: "' +
            text +
            '". Please check the FAQ or use the form below for human assistance!',
        });
      }, 1500);
    }
  }
}
