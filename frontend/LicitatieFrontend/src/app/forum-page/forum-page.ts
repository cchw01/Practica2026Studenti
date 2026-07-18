import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { ForumPost } from '../Models/forum-post/forum-post';
import { ForumPostService } from '../Models/forum-post/forum-post-service';
import { ForumComment } from '../Models/forum-comment/forum-comment';
import { ForumCommentService } from '../Models/forum-comment/forum-comment-service';
import { AuthService } from  '../services/auth';

type SortOption = 'latest' | 'oldest' | 'comments';

interface ForumPostPreview {
  id: number;
  userId: number;
  date: string;
  title: string;
  description: string;
  commentsCount: number;
}

@Component({
  selector: 'app-forum-page',
  standalone: false,
  templateUrl: './forum-page.html',
  styleUrl: './forum-page.scss',
})
export class ForumPage implements OnInit {
  sortOption: SortOption = 'latest';

  posts: ForumPostPreview[] = [];

  isLoading = false;
  errorMessage = '';
  public  currentUserId: number | null = null;

  private commentCounts = new Map<number, number>();

  constructor(
    private forumPostService: ForumPostService,
    private forumCommentService: ForumCommentService,
    private cdr: ChangeDetectorRef,
     private authService: AuthService, 
    
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadForumPosts();
    this.loadForumComments();
  }

  loadForumPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.forumPostService.getForumPosts().subscribe({
      next: (forumPosts: ForumPost[]) => {
        this.posts = forumPosts.map((forumPost) =>
          this.convertToPreview(forumPost),
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading forum posts:', error);

        this.errorMessage =
          'The forum discussions could not be loaded.';

        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadForumComments(): void {
    this.forumCommentService.getForumComments().subscribe({
      next: (forumComments: ForumComment[]) => {
        this.calculateCommentCounts(forumComments);
        this.updatePostCommentCounts();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading forum comments:', error);
        this.cdr.detectChanges();
      },
    });
  }

  get visiblePosts(): ForumPostPreview[] {
    return [...this.posts].sort((firstPost, secondPost) => {
      if (this.sortOption === 'comments') {
        return (
          secondPost.commentsCount -
          firstPost.commentsCount
        );
      }

      const firstDate = new Date(firstPost.date).getTime();
      const secondDate = new Date(secondPost.date).getTime();

      if (this.sortOption === 'oldest') {
        return firstDate - secondDate;
      }

      return secondDate - firstDate;
    });
  }

  getUserLabel(userId: number): string {
    return `User #${userId}`;
  }

  getInitials(userId: number): string {
    return `U${userId}`;
  }

  retryLoading(): void {
    this.loadForumPosts();
    this.loadForumComments();
  }

  private calculateCommentCounts(
    forumComments: ForumComment[],
  ): void {
    this.commentCounts.clear();

    for (const comment of forumComments) {
      const currentCount =
        this.commentCounts.get(comment.forumPostId) ?? 0;

      this.commentCounts.set(
        comment.forumPostId,
        currentCount + 1,
      );
    }
  }

  private updatePostCommentCounts(): void {
    this.posts = this.posts.map((post) => ({
      ...post,
      commentsCount:
        this.commentCounts.get(post.id) ?? 0,
    }));
  }

  private convertToPreview(
    forumPost: ForumPost,
  ): ForumPostPreview {
    return {
      id: forumPost.id,
      userId: forumPost.userId,
      date: forumPost.date,
      title: forumPost.title,
      description: forumPost.description,
      commentsCount:
        this.commentCounts.get(forumPost.id) ?? 0,
    };
  }
}