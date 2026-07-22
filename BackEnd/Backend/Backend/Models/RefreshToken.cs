using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
