import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumCommentDto, CreateForumCommentDto, UpdateForumCommentDto } from './forum-comment';

@Injectable({
  providedIn: 'root',
})
export class ForumCommentService {
  private readonly apiUrl = 'https://localhost:7137/api/ForumComment';

  constructor(private http: HttpClient) {}

  getForumComments(): Observable<ForumCommentDto[]> {
    return this.http.get<ForumCommentDto[]>(this.apiUrl);
  }

  getCommentsByPostId(postId: number): Observable<ForumCommentDto[]> {
    return this.http.get<ForumCommentDto[]>(`${this.apiUrl}/post/${postId}`);
  }

  createForumComment(forumComment: CreateForumCommentDto): Observable<void> {
    return this.http.post<void>(this.apiUrl, forumComment);
  }

  updateForumComment(id: number, forumComment: UpdateForumCommentDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, forumComment);
  }

  deleteForumComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
