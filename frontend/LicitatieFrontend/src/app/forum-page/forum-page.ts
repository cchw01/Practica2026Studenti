import { Component } from '@angular/core';

type SortOption = 'latest' | 'oldest' | 'comments';

interface ForumPostPreview {
  id: number;
  userName: string;
  dateTime: string;
  title: string;
  description: string;
  commentsCount: number;
}

@Component({
  selector: 'app-forum-page',
  standalone: false,
  templateUrl: './forum-page.html',
  styleUrl: './forum-page.css',
})
export class ForumPage {
  sortOption = '';

  //TEMPORAR TO BE REPLACED
  readonly posts: ForumPostPreview[] = [
    {
      id: 1,
      userName: 'Maria Popescu',
      dateTime: '2026-07-13T09:30:00',
      title: 'Introduce yourself!',
      description:'',
      commentsCount: 1,
    },
  ];

get visiblePosts(): ForumPostPreview[] {
  return [...this.posts].sort((firstPost, secondPost) => {
    if (this.sortOption === 'comments') {
      return secondPost.commentsCount - firstPost.commentsCount;
    }

    const firstDate = new Date(firstPost.dateTime).getTime();
    const secondDate = new Date(secondPost.dateTime).getTime();

    if (this.sortOption === 'oldest') {
      return firstDate - secondDate;
    }

    return secondDate - firstDate;
  });
}

  getInitials(userName: string): string {
    return userName
      .split(' ')
      .filter((namePart) => namePart.length > 0)
      .slice(0, 2)
      .map((namePart) => namePart.charAt(0).toUpperCase())
      .join('');
  }

}
