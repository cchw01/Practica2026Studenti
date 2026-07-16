import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private router: Router) {}

  onSubmit() {
    this.successMessage = 'Item added successfully!';
    console.log({
      name: this.name,
      startPrice: this.startPrice,
      category: this.category,
      description: this.description,
      location: this.location,
      startDate: new Date(this.startDate),
      endDate: new Date(this.endDate),
      status: StatusEnum.Added,
    });
  }
}