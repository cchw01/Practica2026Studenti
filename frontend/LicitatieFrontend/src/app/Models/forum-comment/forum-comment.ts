export class ForumComment {
    id!: number;
    userId!: number;
    forumPostId!: number; 
    date!: string;          
    commentText!: string; 
    constructor(forumComment?: Partial<ForumComment>) {
        Object.assign(this, forumComment);
    }
}