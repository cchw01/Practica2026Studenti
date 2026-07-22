using System.Text.Json.Serialization;

namespace Backend.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportTargetType
    {
        User,
        AuctionItem,
        ForumPost
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportReason
    {
        Spam,
        Harassment,
        InappropriateContent,
        Fraud,
        Other
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ReportStatus
    {
        Pending,
        InReview,
        Dismissed,
        ActionTaken
    }

    public class Report
    {
        public int Id { get; set; }

        public int ReporterId { get; set; }
        public User? Reporter { get; set; }

        public ReportTargetType TargetType { get; set; }

        public int? ReportedUserId { get; set; }
        public User? ReportedUser { get; set; }

        public int? ReportedAuctionItemId { get; set; }
        public AuctionItem? ReportedAuctionItem { get; set; }

        public int? ReportedForumPostId { get; set; }
        public ForumPost? ReportedForumPost { get; set; }

        public ReportReason Reason { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportStatus Status { get; set; } = ReportStatus.Pending;

        public DateTime? ReviewedAt { get; set; }
    }
}