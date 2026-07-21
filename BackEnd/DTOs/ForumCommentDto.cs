using System.ComponentModel.DataAnnotations;
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
        [Required(ErrorMessage = "Post ID is required.")]
        public int ForumPostId { get; set; }

        [Required(ErrorMessage = "User ID is required.")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Comment text is required.")]
        [MinLength(2, ErrorMessage = "Comment must have at least 2 characters.")]
        [MaxLength(1000, ErrorMessage = "Comment is too long (maximum 1000 characters).")]
        public string CommentText { get; set; } = string.Empty;
    }   

    public class UpdateForumCommentDto
    {
        [Required(ErrorMessage = "Comment text is required.")]
        [MinLength(2, ErrorMessage = "Comment must have at least 2 characters.")]
        [MaxLength(1000, ErrorMessage = "Comment is too long (maximum 1000 characters).")]
        public string CommentText { get; set; } = string.Empty;
    }
}
