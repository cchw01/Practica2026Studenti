export class ForumComment {
    id!: number;
    userId!: number;
    forumPostId!: number; 
    Date!: Date;          
    commentText!: string; 
    constructor(forumComment?: Partial<ForumComment>) {
        Object.assign(this, forumComment);
    }
}