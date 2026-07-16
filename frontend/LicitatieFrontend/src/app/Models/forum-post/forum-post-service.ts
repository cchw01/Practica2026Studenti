import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumPost } from './forum-post';
@Injectable({
  providedIn: 'root',
})
export class ForumPostService {
    private readonly apiUrl = 'https://localhost:7137/api/ForumPost'; 
    constructor(private http: HttpClient) {}
    getForumPosts() : Observable<ForumPost[]> {
        return this.http.get<ForumPost[]>(this.apiUrl);
    }
    getForumPostById(id: number) : Observable<ForumPost> {
        return this.http.get<ForumPost>(`${this.apiUrl}/${id}`);
    }
    createForumPost(forumPost: ForumPost) : Observable<ForumPost> {
        return this.http.post<ForumPost>(this.apiUrl, forumPost);
    }
    updateForumPost(forumPost: ForumPost) : Observable<ForumPost> {
        return this.http.put<ForumPost>(this.apiUrl, forumPost);
    }
    deleteForumPost(id: number) : Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}