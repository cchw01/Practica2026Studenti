using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; }
        [ForeignKey("UserId")]
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
