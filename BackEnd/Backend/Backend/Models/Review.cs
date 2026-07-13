using Backend.UserSpace;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Review
{
    public int Id { get; set; }

    public int? ReviewerId { get; set; }

    public User Reviewer { get; set; }

    public int? ReviewedUserId { get; set; }

    public User ReviewedUser { get; set; }

    [Range(0, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string Comment { get; set; }

    public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
}