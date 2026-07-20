using System;
namespace Backend.Models
{
    public class ForumComment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public ForumPost? ForumPost { get; set; }
        public int ForumPostId { get; set; } 
        public User? User { get; set; }
        public DateTime Date { get; set; }
        public string CommentText { get; set; } = string.Empty;
    }
}