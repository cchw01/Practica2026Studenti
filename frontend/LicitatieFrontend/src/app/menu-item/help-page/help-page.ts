import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-help-page',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './help-page.html',
  styleUrls: ['./help-page.css'],
})
export class HelpPageComponent implements OnInit {
  helpForm!: FormGroup;

  // FAQ with open/closed state
  faqs = [
    {
      question: 'How do I place a bid on an auction?',
      answer:
        'Go to the page of the item you want and enter your amount in the "Bid now" field. Your bid must be higher than the current price.',
      isOpen: false,
    },
    {
      question: 'How do I list an item for sale?',
      answer:
        'Go to the "My Profile" section and click "Add Auction". Fill in the details and wait for admin validation.',
      isOpen: false,
    },
    {
      question: 'How do I know if I won an auction?',
      answer:
        'You will receive an email and in-app notification when the auction ends and you have the highest bid.',
      isOpen: false,
    },
  ];

  isChatOpen = false;
  isTyping = false; // AI typing effect
  chatMessages: { sender: string; text: string }[] = [
    { sender: 'ai', text: "Hi! I'm your virtual assistant. How can I help you today?" },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.helpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      issue: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Toggle a FAQ item open/closed
  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  onSubmitHelpForm() {
    if (this.helpForm.valid) {
      alert('Your ticket has been submitted successfully! We will contact you soon.');
      this.helpForm.reset();
    } else {
      alert('Please fill in all fields correctly.');
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

      // Simulate a delayed AI response
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
