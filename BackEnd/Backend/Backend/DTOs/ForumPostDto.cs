using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ForumPostCreateDto
    {
        [Required]
        [StringLength(
            50,
            ErrorMessage = "Forum Post title can have a maximum of 50 characters.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(
            200,
            ErrorMessage = "Forum Post description can have a maximum of 200 characters.")]
        public string Description { get; set; } = string.Empty;

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "UserId must be greater than 0.")]
        public int UserId { get; set; }
    }
    public class ForumPostUpdateDto
    {
        [StringLength(
            50,
            ErrorMessage = "Forum Post title can have a maximum of 50 characters.")]
        public string Title { get; set; } = string.Empty;

        [StringLength(
            200,
            ErrorMessage = "Forum Post description can have a maximum of 200 characters.")]
        public string Description { get; set; } = string.Empty;
    }
    public class ForumPostResponseDto
    {
        public int Id { get; set; }

        public string UserName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int CommentsCount { get; set; }
    }

}
