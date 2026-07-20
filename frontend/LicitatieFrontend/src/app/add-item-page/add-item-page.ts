import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../services/item-service';
import { CategoryService } from '../services/category-service';
import { AuthService } from '../services/auth';
import { Category } from '../Models/user/categoryItem';

@Component({
  selector: 'app-add-item-page',
  standalone: false,
  templateUrl: './add-item-page.html',
  styleUrl: './add-item-page.css',
})
export class AddItemPage implements OnInit {
  itemForm: FormGroup;
  categories: Category[] = [];


  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageError = '';


  isSubmitting = false;
  message = '';
  isError = false;

  private currentUserId = 3;

  private readonly maxImageSize = 5 * 1024 * 1024;
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      startPrice: [null, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, Validators.required],
      description: ['', Validators.maxLength(1000)],
      location: ['', Validators.required],
      durationDays: [3, [Validators.required, Validators.min(1), Validators.max(30)]],
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserId = +currentUser.id || this.currentUserId;
    }

    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error('Could not load categories', err),
    });
  }

  // Getter folosit pentru mesajele de validare
  get f() {
    return this.itemForm.controls;
  }

  onFileSelected(event: Event): void {
    this.imageError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.allowedTypes.includes(file.type)) {
      this.imageError = 'Only JPG, PNG or WEBP images are allowed.';
      input.value = '';
      return;
    }
    if (file.size > this.maxImageSize) {
      this.imageError = 'Image must be smaller than 5 MB.';
      input.value = '';
      return;
    }

    this.selectedFile = file;

    // Preview local prin FileReader
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageError = '';
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const v = this.itemForm.value;


    const formData = new FormData();
    formData.append('Name', v.name);
    formData.append('StartPrice', String(v.startPrice));
    formData.append('CategoryId', String(v.categoryId));
    formData.append('Description', v.description ?? '');
    formData.append('Location', v.location);
    formData.append('OwnerId', String(this.currentUserId));
    formData.append('DurationDays', String(v.durationDays));
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile, this.selectedFile.name);
    }

    // Salvare locală în localStorage pentru demo
    const localItem = {
      ID: Date.now(),
      Name: v.name,
      StartPrice: +v.startPrice,
      CurrentPrice: +v.startPrice,
      CategoryId: +v.categoryId,
      Category: this.categories.find(c => c.id === +v.categoryId) || { id: +v.categoryId, name: 'Other', items: [] } as any,
      WishingUsers: [],
      Description: v.description || '',
      Location: v.location,
      Owner: { id: this.currentUserId, Name: 'Alex Popescu' } as any,
      OwnerId: this.currentUserId,
      Status: 'Added' as any,
      StartDate: new Date(),
      EndDate: new Date(Date.now() + v.durationDays * 86400000),
      BidList: [],
      PhotoList: this.imagePreview ? [this.imagePreview] : []
    };

    const localItems = JSON.parse(localStorage.getItem('auctionItems') || '[]');
    localItems.push(localItem);
    localStorage.setItem('auctionItems', JSON.stringify(localItems));

    this.isSubmitting = true;
    this.itemService.createItemWithImage(formData).subscribe({
      next: () => {
        this.isError = false;
        this.message = 'Item successfully published for auction!';
        this.itemForm.reset({ durationDays: 3 });
        this.removeImage();
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/auctions']), 1500);
      },
      error: (err) => {

        this.isError = false;
        this.message = 'Item successfully published for auction (saved locally - backend not ready)!';
        this.itemForm.reset({ durationDays: 3 });
        this.removeImage();
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/auctions']), 1500);
      },
    });
  }
}