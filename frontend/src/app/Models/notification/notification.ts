import { User } from '../user/user';

export interface AppNotification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}
