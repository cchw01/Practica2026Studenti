using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Review
{
    public int Id { get; set; }

    [Required]
    public int ReviewerId { get; set; }

    [ForeignKey(nameof(ReviewerId))]
    public string Reviewer { get; set; }

    [Required]
    public int ReviewedUserId { get; set; }

    [ForeignKey(nameof(ReviewedUserId))]
    public string ReviewedUser { get; set; }

    [Range(0, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; }

    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
}