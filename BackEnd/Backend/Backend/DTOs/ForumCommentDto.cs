using System.Diagnostics.Contracts;

namespace Backend.DTOs
{
    public class ForumCommentDto
    {
        public int Id { get; set; }
        public int ForumPostId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string CommentText { get; set; } = string.Empty;
    }

    public class CreateForumCommentDto
    {
        public int ForumPostId { get; set; }
        public int UserId { get; set; }
        public string CommentText { get; set; } = string.Empty;
    }   

    public class UpdateForumCommentDto
    {
        public string CommentText { get; set; } = string.Empty;
    }
}
