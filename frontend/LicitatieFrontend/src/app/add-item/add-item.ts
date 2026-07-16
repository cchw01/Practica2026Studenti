import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ItemService } from '../services/item-service';
import { AuthService } from '../services/auth';
import { StatusEnum } from '../Models/status-enum';

@Component({
  selector: 'app-add-item',
  standalone: false,
  templateUrl: './add-item.html',
  styleUrl: './add-item.css',
})
export class AddItem {
  name = '';
  startPrice = 0;
  category = '';
  description = '';
  imageUrl = '';
  location = '';
  startDate = '';
  endDate = '';
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private router: Router,
    private itemService: ItemService,
    private authService: AuthService,
  ) {}

  onSubmit() {
    if (!this.name || this.startPrice <= 0 || !this.location || !this.startDate || !this.endDate) {
      this.errorMessage = 'Please fill in all required fields (Name, Price, Location, Start Date, End Date).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();
    const ownerId = currentUser ? (+currentUser.id || 1) : 1;

    const newItem: any = {
      Name: this.name,
      StartPrice: this.startPrice,
      CurrentPrice: this.startPrice,
      CategoryId: 1, // default; category field is free text for now
      Description: this.description,
      Location: this.location,
      OwnerId: ownerId,
      Status: StatusEnum.Added,
      StartDate: new Date(this.startDate).toISOString(),
      EndDate: new Date(this.endDate).toISOString(),
    };

    this.itemService.createItem(newItem).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Item published! Redirecting to auctions...';
        setTimeout(() => this.router.navigate(['/auctions']), 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to publish item. Make sure the backend is running.';
        console.error(err);
      },
    });
  }
}