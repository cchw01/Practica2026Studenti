import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ForumPost } from '../../Models/forum-post/forum-post';
import { ForumComment } from '../../Models/forum-comment/forum-comment';
import { ForumPostService } from '../../Models/forum-post/forum-post-service';
import { ForumCommentService } from '../../Models/forum-comment/forum-comment-service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-forum-post-details',
  standalone: false,
  templateUrl: './forum-post-details.html',
  styleUrl: './forum-post-details.css',
})
export class ForumPostDetails implements OnInit {
  post: ForumPost | null = null;
  comments: ForumComment[] = [];

  commentForm: FormGroup;

  isLoadingPost = false;
  isLoadingComments = false;
  isSubmittingComment = false;

  postErrorMessage = '';
  commentsErrorMessage = '';
  submitErrorMessage = '';

  isEditingPost = false;
  editPostForm: FormGroup;

  public postId = 0; //Temporar are nevoie de user logat.
  //public readonly currentUserId = 1;
  public  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private forumPostService: ForumPostService,
    private forumCommentService: ForumCommentService,
    private cdr: ChangeDetectorRef,
     private authService: AuthService,
  ) {
    this.commentForm = this.formBuilder.group({
      commentText: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(1000),
        ],
      ],
    });
    this.editPostForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId(); 
    const idParameter = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(idParameter);

    if (!idParameter || Number.isNaN(parsedId) || parsedId <= 0) {
      this.postErrorMessage = 'The discussion ID is not valid.';
      return;
    }

    this.postId = parsedId;

    this.loadForumPost();
    this.loadForumComments();
  }

  loadForumPost(): void {
    this.isLoadingPost = true;
    this.postErrorMessage = '';

    this.forumPostService
      .getForumPostById(this.postId)
      .subscribe({
        next: (forumPost: ForumPost) => {
          this.post = forumPost;
          this.isLoadingPost = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error loading forum post:', error);

          this.postErrorMessage = 'The discussion could not be loaded.';
          this.isLoadingPost = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadForumComments(): void {
    this.isLoadingComments = true;
    this.commentsErrorMessage = '';

    this.forumCommentService
      .getCommentsByPostId(this.postId)
      .subscribe({
        next: (forumComments: ForumComment[]) => {
          this.comments = [...forumComments].sort(
            (firstComment, secondComment) =>
              new Date(firstComment.date).getTime() - new Date(secondComment.date).getTime(),
          );

          this.isLoadingComments = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error loading forum comments:', error);
          this.commentsErrorMessage = 'The comments could not be loaded.';
          this.isLoadingComments = false;
          this.cdr.detectChanges();
        },
      });
  }

  submitComment(): void {
    this.commentForm.markAllAsTouched();

    if (this.commentForm.invalid || this.isSubmittingComment) {
      return;
    }

    if (this.currentUserId === null) {
      this.submitErrorMessage = 'The authenticated user could not be identified.';
      return;
    }

    const commentText = this.commentForm.value.commentText?.trim();

    if (!commentText) {
      return;
    }

    const forumComment = new ForumComment({
      id: 0,
      userId: this.currentUserId,
      forumPostId: this.postId,
      date: new Date().toISOString(),
      commentText,
    });

    this.isSubmittingComment = true;
    this.submitErrorMessage = '';

    this.forumCommentService
      .createForumComment(forumComment)
      .subscribe({
        next: () => {
          this.commentForm.reset();
          this.isSubmittingComment = false;

          this.loadForumComments();
        },

        error: (error) => {
          console.error('Error creating forum comment:', error);

          this.submitErrorMessage = 'The comment could not be published.';
          this.isSubmittingComment = false;
          this.cdr.detectChanges();
        },
        
      });
      
  }
  deletePost(): void {
  if (!this.post) {
    return;
  }
  

  const confirmed = confirm('Are you sure you want to delete this discussion? This action cannot be undone.');
  if (!confirmed) {
    return;
  }

  this.forumPostService.deleteForumPost(this.post.id).subscribe({
    next: () => {
      this.router.navigate(['/forum-page']);
    },
    error: (error) => {
      console.error('Error deleting forum post:', error);
      this.postErrorMessage = 'The discussion could not be deleted.';
      this.cdr.detectChanges();
    },
  });
}

startEditPost(): void {
    if (!this.post) return;
    this.editPostForm.patchValue({
      title: this.post.title,
      description: this.post.description,
    });
    this.isEditingPost = true;
  }

  cancelEditPost(): void {
    this.isEditingPost = false;
  }

  saveEditPost(): void {
    if (this.editPostForm.invalid || !this.post) return;

    const { title, description } = this.editPostForm.value;

    this.forumPostService.updateForumPost(this.post.id, { title, description } as any).subscribe({
      next: () => {
        this.isEditingPost = false;
        this.loadForumPost();
      },
      error: (error) => {
        console.error('Error updating forum post:', error);
        this.postErrorMessage = 'The discussion could not be updated.';
        this.cdr.detectChanges();
      },
    });
  }

  get editTitleControl() {
    return this.editPostForm.get('title');
  }

  get editDescriptionControl() {
    return this.editPostForm.get('description');
  }

deleteComment(commentId: number): void {
  const confirmed = confirm('Are you sure you want to delete this comment?');
  if (!confirmed) {
    return;
  }

  this.forumCommentService.deleteForumComment(commentId).subscribe({
    next: () => {
      this.loadForumComments();
    },
    error: (error) => {
      console.error('Error deleting forum comment:', error);
      this.commentsErrorMessage = 'The comment could not be deleted.';
      this.cdr.detectChanges();
    },
  });
}
editingCommentId: number | null = null;
  editCommentText = '';

  startEditComment(comment: ForumComment): void {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.commentText;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveEditComment(commentId: number): void {
    const trimmed = this.editCommentText.trim();
    if (trimmed.length < 2) return;

    this.forumCommentService.updateForumComment(commentId, { commentText: trimmed }).subscribe({
      next: () => {
        this.editingCommentId = null;
        this.editCommentText = '';
        this.loadForumComments();
      },
      error: (error) => {
        console.error('Error updating comment:', error);
        this.commentsErrorMessage = 'The comment could not be updated.';
        this.cdr.detectChanges();
      },
    });
  }


  getUserLabel(userId: number, userName?: string): string {
    return userName ? userName : `User #${userId}`;
  }

  getInitials(userName?: string, userId?: number): string {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase();
    }
    return `U${userId}`;
  }

  goBackToForum(): void {
    this.router.navigate(['/forum-page']);
  }

  get commentTextControl() {
    return this.commentForm.get('commentText');
  }
}