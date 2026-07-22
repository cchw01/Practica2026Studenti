import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumPost, CreateReportDto } from './forum-post';
@Injectable({
  providedIn: 'root',
})
export class ForumPostService {
    private readonly apiUrl = 'https://localhost:7137/api/ForumPost'; 
    private readonly reportUrl = 'https://localhost:7137/api/Report';

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

    updateForumPost(id: number, forumPost: ForumPost) : Observable<ForumPost> {
        return this.http.put<ForumPost>(`${this.apiUrl}/${id}`, forumPost);
    }
    
    deleteForumPost(id: number) : Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
     submitReport(report: CreateReportDto) : Observable<any> {
        return this.http.post(this.reportUrl, report);
        // TODO: verifică cu colegii ce nume are efectiv controller-ul (poate fi ReportController -> api/Report)
        // și ajustează reportUrl / payload-ul (report) după structura lor reală
    }
}