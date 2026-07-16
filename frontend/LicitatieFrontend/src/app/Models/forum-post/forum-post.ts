export class ForumPost{
    Id!: number;
    UserId!: number;
    Title!: string;
    Date!: Date;
    Description!: string;
    CommentList!: undefined // List<Comment>;

    constructor( forumPost?: Partial<ForumPost>){
        Object.assign(this, forumPost);
    }
}