
using System;
using Backend.UserSpace;
namespace Backend.Models
{
    public class ForumComment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ForumPostId { get; set; } // FOARTE IMPORTANT: Asta leagă comentariul de post
        public DateTime Date { get; set; }
        public string CommentText { get; set; }
    }
}