export class ForumCommentDto {
    id!: number;
    userId!: number;
    userName!: string;
    forumPostId!: number; 
    date!: string;          
    commentText!: string; 
    
    constructor(init?: Partial<ForumCommentDto>) {
        Object.assign(this, init);
    }
}

export interface CreateForumCommentDto {
    forumPostId: number;
    userId: number;
    commentText: string;
}

export interface UpdateForumCommentDto {
    commentText: string;
}

// Pastram clasa veche ca un "alias" pentru a nu strica imediat paginile la care lucreaza colegul
export class ForumComment extends ForumCommentDto {}