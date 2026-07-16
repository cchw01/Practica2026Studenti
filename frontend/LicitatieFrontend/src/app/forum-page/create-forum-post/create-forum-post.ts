import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ForumPost } from '../../Models/forum-post/forum-post';
import { ForumPostService } from '../../Models/forum-post/forum-post-service';

function noWhitespaceValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;

  if (typeof value === 'string' && value.trim().length === 0) {
    return { whitespace: true };
  }

  return null;
}

@Component({
  selector: 'app-create-forum-post',
  standalone: false,
  templateUrl: './create-forum-post.html',
  styleUrl: './create-forum-post.css',
})
export class CreateForumPost {
  isSubmitting = false;
  submitErrorMessage = '';

  readonly createPostForm: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
  }>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly forumPostService: ForumPostService,
    private readonly router: Router,
  ) {
    this.createPostForm = this.formBuilder.nonNullable.group({
      title: [ '',
        [
          Validators.required,
          noWhitespaceValidator,
          Validators.minLength(3),
          Validators.maxLength(150),
        ],
      ],

      description: [ '',
        [
          Validators.required,
          noWhitespaceValidator,
          Validators.minLength(10),
          Validators.maxLength(5000),
        ],
      ],
    });
  }

  submitPost(): void {
    this.createPostForm.markAllAsTouched();
    this.submitErrorMessage = '';

    if (this.createPostForm.invalid || this.isSubmitting) {
      return;
    }

    const title = this.createPostForm.controls.title.value.trim();
    const description =
      this.createPostForm.controls.description.value.trim();

    const forumPost = new ForumPost({
      title,
      description,
      date: new Date().toISOString(),
    });

    this.isSubmitting = true;

    this.forumPostService.createForumPost(forumPost).subscribe({
      next: (createdPost) => {
        this.isSubmitting = false;

        if (createdPost?.id) {
          this.router.navigate(['/forum', createdPost.id]);
          return;
        }

        this.router.navigate(['/forum']);
      },

      error: (error: HttpErrorResponse) => {
        console.error('Error creating forum post:', error);

        this.submitErrorMessage =
          this.getSubmitErrorMessage(error);

        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/forum']);
  }

  get titleControl(): FormControl<string> {
    return this.createPostForm.controls.title;
  }

  get descriptionControl(): FormControl<string> {
    return this.createPostForm.controls.description;
  }

  private getSubmitErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'The server is currently unavailable.';
    }

    if (error.status === 400) {
      return 'The discussion could not be created.';
    }

    return 'An unexpected error occurred while creating the discussion.';
  }
}