import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocalPicture {
  name: string;
  file: File;
}

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  private apiUrl = 'https://localhost:7137/api/Picture';

  constructor(private http: HttpClient) {}

  addPictures(pictures: LocalPicture[]): Observable<any> {
    const formData = new FormData();

    pictures.forEach((item, index) => {
      formData.append(`[${index}].Name`, item.name);
      formData.append(`[${index}].Picture`, item.file);
    });

    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }
}