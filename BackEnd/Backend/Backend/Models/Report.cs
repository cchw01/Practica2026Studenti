using System.Text.Json.Serialization;

namespace Backend.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportTargetType
    {
        Unknown = 0,
        User = 1,
        AuctionItem = 2,
        ForumPost = 3
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportReason
    {
        Unknown = 0,
        Spam = 1,
        Harassment = 2,
        InappropriateContent = 3,
        FakeAuction = 4,
        CounterfeitItem = 5,
        Fraud = 6,
        Other = 7
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportStatus
    {
        Pending = 0,
        InReview = 1,
        Dismissed = 2,
        ActionTaken = 3
    }

    public class Report
    {
        public int Id { get; set; }

        // Persoana care trimite reportul.
        public int ReporterId { get; set; }
        public User? Reporter { get; set; }

        // Tipul entității raportate.
        public ReportTargetType TargetType { get; set; }

        // Exact una dintre următoarele trei ținte va avea valoare.
        public int? ReportedUserId { get; set; }
        public User? ReportedUser { get; set; }

        public int? AuctionItemId { get; set; }
        public AuctionItem? AuctionItem { get; set; }

        public int? ForumPostId { get; set; }
        public ForumPost? ForumPost { get; set; }

        // Motivul standard și explicația scrisă de utilizator.
        public ReportReason Reason { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportStatus Status { get; set; } = ReportStatus.Pending;

        // Se completează când un admin procesează reportul.
        public int? ReviewedByAdminId { get; set; }
        public User? ReviewedByAdmin { get; set; }

        public DateTime? ReviewedAt { get; set; }
        public string? AdminComment { get; set; }
    }
}