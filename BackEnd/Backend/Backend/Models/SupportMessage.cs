namespace Backend.Models
{
    public class SupportMessage
    {
        public int Id { get; set; }
        public string Source { get; set; } = "Contact"; 
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string? IssueType { get; set; }
        public string Message { get; set; } = "";
        public int? UserId { get; set; } 
        public bool IsResolved { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}