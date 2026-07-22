import { ForumComment } from "../forum-comment/forum-comment";

export class ForumPost{
    id!: number;
    userId!: number;
    userName?: string;
    title!: string;
    date!: string;
    description!: string;
    commentsCount?: number;
    commentList?: ForumComment[];

    constructor( forumPost?: Partial<ForumPost>){
        Object.assign(this, forumPost);
    }
}
export interface CreateReportDto {
  targetType: 'ForumPost' | 'ForumComment';
  targetId: number;
  reason: string;
  reporterId: number;
}

export const REPORT_REASONS: string[] = [
  'Spam',
  'Limbaj licențios',
  'Conținut ofensator / hărțuire',
  'Informații false',
  'Alt motiv',
];