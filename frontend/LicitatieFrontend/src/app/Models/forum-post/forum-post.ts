import { ForumComment } from "../forum-comment/forum-comment";

export class ForumPost{
    id!: number;
    userId!: number;
    title!: string;
    date!: string;
    description!: string;
    commentList?: ForumComment[];

    constructor( forumPost?: Partial<ForumPost>){
        Object.assign(this, forumPost);
    }
}