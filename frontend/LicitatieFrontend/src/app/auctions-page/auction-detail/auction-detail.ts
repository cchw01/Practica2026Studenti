import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuctionItem } from '../../Models/item-model';
import { ItemService } from '../../services/item-service';

@Component({
  selector: 'app-auction-detail',
  standalone: false,
  templateUrl: './auction-detail.html',
  styleUrls: ['./auction-detail.scss']
})
export class AuctionDetail implements OnInit {
  item = signal<AuctionItem | null>(null);
  loading = signal(true);
  notFound = signal(false);

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id)) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.itemService.getItemById(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Eroare la încărcarea item-ului', err);
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }
}