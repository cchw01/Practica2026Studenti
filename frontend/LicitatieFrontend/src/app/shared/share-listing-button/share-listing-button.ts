import {
  Component,
  Input,
  OnDestroy,
  signal
} from '@angular/core';

@Component({
  selector: 'app-share-listing-button',
  standalone: true,
  templateUrl: './share-listing-button.html',
  styleUrl: './share-listing-button.css'
})
export class ShareListingButton implements OnDestroy {
  @Input({ required: true }) itemId!: number;

  readonly copied = signal(false);

  private resetTimeout?: ReturnType<typeof setTimeout>;

  async copyLink(): Promise<void> {
    const url = `${window.location.origin}/auctions/${this.itemId}`;

    try {
      await navigator.clipboard.writeText(url);
      this.showCopiedState();
    } catch {
      this.copyUsingFallback(url);
    }
  }

  private copyUsingFallback(url: string): void {
    const textarea = document.createElement('textarea');

    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand('copy');

      if (successful) {
        this.showCopiedState();
      } else {
        console.error('Nu s-a putut copia linkul.');
      }
    } catch (error) {
      console.error(
        'Nu s-a putut copia linkul în clipboard.',
        error
      );
    } finally {
      textarea.remove();
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