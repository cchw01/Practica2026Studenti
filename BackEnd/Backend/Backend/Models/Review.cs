using Microsoft.AspNetCore.Http.HttpResults;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int ReviewerId { get; set; }

        [ForeignKey(nameof(ReviewerId))]
        public User Reviewer { get; set; }

        [Required]
        public int ReviewedUserId { get; set; }

        [ForeignKey(nameof(ReviewedUserId))]
        public User ReviewedUser { get; set; }

        [Range(0, 5)]
        public float Rating { get; set; }

        [MaxLength(1000)]
        public string Comment { get; set; }

        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    }
}