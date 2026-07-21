import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-help-page',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './help-page.html',
  styleUrls: ['./help-page.scss'],
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
    {
      question: 'Can I cancel a bid after placing it?',
    answer:
      'Bids are binding once placed and generally cannot be cancelled. Please make sure of your amount before confirming.',
    isOpen: false,
    },
    {
    question: 'How do I create an account?',
    answer:
      'Click "Register" in the top menu, fill in your username, email, and password, then confirm your email address to activate your account.',
    isOpen: false,
    },
    {
    question: 'I forgot my password. What should I do?',
    answer:
      'Click "Forgot password?" on the login page and follow the instructions sent to your registered email to reset it.',
    isOpen: false,
    },
    {
    question: 'How is the item delivered after I win?',
    answer:
      'After payment confirmation, the seller will arrange shipping or pickup. Delivery details are exchanged through your account messages.',
    isOpen: false,
    },
    {
    question: 'What happens if the seller does not deliver the item?',
    answer:
      'Contact our support team immediately through the form below. We investigate all disputes and may suspend sellers who fail to deliver.',
    isOpen: false,
    },
    {
    question: 'Can I edit or remove an auction after posting it?',
    answer:
      'You can edit or remove an auction only before it receives its first bid. After that, changes are locked to protect bidders.',
    isOpen: false,
    },
    {
    question: 'What if my item does not sell?',
    answer: 'You can lower your reserve price and relist it, or offer it to the top bidder.',
    isOpen: false, 
    },
    {
    question: 'When do I get paid?',
    answer: 'Payouts are sent to your bank 3–5 business days after buyer payment clears.',
    isOpen: false, 
    },
    {
    question: 'Who pays for shipping?',
    answer: 'Buyers pay shipping costs unless you opt to offer free shipping.',
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
