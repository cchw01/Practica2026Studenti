
import { User } from './user/user';


export interface ForumComment {
  id: number;
  user: User;
  date: string; 
  commentText: string;
 // post: ForumPost;
}