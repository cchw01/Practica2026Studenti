import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ForumPost } from '../../Models/forum-post/forum-post';
import { ForumComment } from '../../Models/forum-comment/forum-comment';
import { ForumPostService } from '../../Models/forum-post/forum-post-service';
import { ForumCommentService } from '../../Models/forum-comment/forum-comment-service';

@Component({
  selector: 'app-forum-post-details',
  standalone: false,
  templateUrl: './forum-post-details.html',
  styleUrl: './forum-post-details.css',
})
export class ForumPostDetails implements OnInit{ 
  post: ForumPost | null = null;
  comments: ForumComment[] = [];

  commentForm: FormGroup;

  isLoadingPost = false;
  isLoadingComments = false;
  isSubmittingComment = false;

  postErrorMessage = '';
  commentsErrorMessage = '';
  submitErrorMessage = '';

  public postId = 0; //Temporar are nevoie de user logat.
  //public readonly currentUserId = 1;
  public readonly currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private forumPostService: ForumPostService,
    private forumCommentService: ForumCommentService,
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
  }

  ngOnInit(): void {
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
        },

        error: (error) => {
          console.error( 'Error loading forum post:', error,);

          this.postErrorMessage = 'The discussion could not be loaded.';
          this.isLoadingPost = false;
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
        },

        error: (error) => {
          console.error('Error loading forum comments:', error, );
          this.commentsErrorMessage = 'The comments could not be loaded.';
          this.isLoadingComments = false;
        },
      });
  }

submitComment(): void {
  this.commentForm.markAllAsTouched();

  if (
    this.commentForm.invalid ||
    this.isSubmittingComment
  ) {
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
        console.error( 'Error creating forum comment:', error, );

        this.submitErrorMessage = 'The comment could not be published.';
        this.isSubmittingComment = false;
      },
    });
}

  getUserLabel(userId: number): string {
    return `User #${userId}`;
  }

  getInitials(userId: number): string {
    return `U${userId}`;
  }

  goBackToForum(): void {
    this.router.navigate(['/forum']);
  }

  get commentTextControl() {
    return this.commentForm.get('commentText');
  }
}
