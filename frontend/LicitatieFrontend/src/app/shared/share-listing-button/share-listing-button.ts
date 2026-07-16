import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-share-listing-button',
  standalone: false,
  templateUrl: './share-listing-button.html',
  styleUrls: ['./share-listing-button.css']
})
export class ShareListingButton {
  @Input({ required: true }) itemId!: number;

  copied = signal(false);
  private resetTimeout?: ReturnType<typeof setTimeout>;

  async copyLink(): Promise<void> {
    const url = `${window.location.origin}/auctions/${this.itemId}`;

    try {
      await navigator.clipboard.writeText(url);
      this.showCopiedState();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand('copy');
        this.showCopiedState();
      } catch {
        console.error('Nu s-a putut copia linkul în clipboard.');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  private showCopiedState(): void {
    this.copied.set(true);
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
    this.resetTimeout = setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }
}