import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumComment } from './forum-comment'; 

@Injectable({
  providedIn: 'root',
})
export class ForumCommentService {  
    private readonly apiUrl = 'https://localhost:7137/api/ForumComment'; 
    constructor(private http: HttpClient) {}
    getForumComments() : Observable<ForumComment[]> {
        return this.http.get<ForumComment[]>(this.apiUrl);
    }
    getCommentsByPostId(postId: number) : Observable<ForumComment[]> {
        return this.http.get<ForumComment[]>(`${this.apiUrl}/post/${postId}`);
    }
    createForumComment(forumComment: ForumComment) : Observable<ForumComment> {
        return this.http.post<ForumComment>(this.apiUrl, forumComment);
    }
    updateForumComment(forumComment: ForumComment) : Observable<ForumComment> {
        return this.http.put<ForumComment>(this.apiUrl, forumComment);
    }
    deleteForumComment(id: number) : Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}