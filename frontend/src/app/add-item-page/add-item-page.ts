import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from '../services/item-service';
import { CategoryService } from '../services/category-service';
import { AuthService } from '../services/auth';
import { Category } from '../Models/categoryItem';

@Component({
  selector: 'app-add-item-page',
  standalone: false,
  templateUrl: './add-item-page.html',
  styleUrl: './add-item-page.scss',
})
export class AddItemPage implements OnInit {
  itemForm: FormGroup;
  categories: Category[] = [];

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  imageError = '';

  isSubmitting = false;
  message = '';
  isError = false;

  private currentUserId = 0;

  private readonly maxImageSize = 5 * 1024 * 1024;
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
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
    //verificam daca esti logat
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login-page']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'User') {
      alert('Doar utilizatorii obișnuiți pot adăuga licitații.');
      this.router.navigate(['/profile-page']);
      return;
    }
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.currentUserId = userId;
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
    const files = input.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!this.allowedTypes.includes(file.type)) {
        this.imageError = this.translate.instant('ADD_ITEM_PAGE.ERRORS.IMAGE_TYPE');
        continue;
      }
      if (file.size > this.maxImageSize) {
        this.imageError = this.translate.instant('ADD_ITEM_PAGE.ERRORS.IMAGE_SIZE');
        continue;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.imagePreviews.push(reader.result as string);
          this.cdr.detectChanges();
        }
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  clearAllImages(): void {
    this.selectedFiles = [];
    this.imagePreviews = [];
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

    for (const file of this.selectedFiles) {
      formData.append('Images', file, file.name);
      formData.append('Image', file, file.name);
    }

    this.isSubmitting = true;
    this.itemService.createItemWithImage(formData).subscribe({
      next: () => {
        this.isError = false;
        this.message = this.translate.instant('ADD_ITEM_PAGE.SUCCESS');
        this.itemForm.reset({ durationDays: 3 });
        this.clearAllImages();
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/auctions']), 1500);
      },
      error: (err) => {
        this.isError = true;
        const errorMsg =
          err?.error?.message ||
          err?.error ||
          err?.message ||
          'A apărut o eroare la publicarea itemului.';
        this.message = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
        this.isSubmitting = false;
      },
    });
  }
}
