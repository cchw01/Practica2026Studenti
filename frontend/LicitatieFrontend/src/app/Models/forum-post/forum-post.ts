export class ForumPost{
    id!: number;
    userId!: number;
    title!: string;
    Date!: Date;
    Description!: string;
    CommentList!: undefined // List<Comment>;

    constructor( forumPost?: Partial<ForumPost>){
        Object.assign(this, forumPost);
    }
}