using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }

        public int ReviewerId { get; set; }
        public string ReviewerUserName { get; set; } = string.Empty;

        public int ReviewedUserId { get; set; }
        public string ReviewedUserUserName { get; set; } = string.Empty;

        public float Rating { get; set; }
        public string Comment { get; set; } = string.Empty;

        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    }

    public class ReviewCreateDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "ReviewerId must be valid.")]
        public int ReviewerId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ReviewedUserId must be valid.")]
        public int ReviewedUserId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public float Rating { get; set; }

        [StringLength(500, ErrorMessage = "Comment can have a maximum of 500 characters.")]
        public string Comment { get; set; } = string.Empty;
    }
}