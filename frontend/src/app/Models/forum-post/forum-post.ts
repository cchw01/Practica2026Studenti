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