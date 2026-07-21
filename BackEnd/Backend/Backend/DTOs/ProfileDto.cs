namespace Backend.DTOs
{
    public class ProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public double? AverageRating { get; set; }
        public int TotalReviewsReceived { get; set; }
        public string? PictureName { get; set; }
        public List<ReviewDto> ReviewsReceived { get; set; } = new();
        public List<AuctionItemSummaryDto> AddedItems { get; set; } = new();
        public List<AuctionItemSummaryDto> BiddedItems { get; set; } = new();
        public List<AuctionItemSummaryDto> WishList { get; set; } = new();
    }

    public class ReviewDto
    {
        public string Id { get; set; } = string.Empty;
        public string ReviewerId { get; set; } = string.Empty;
        public string ReviewerName { get; set; } = string.Empty;
        public string RevieweeId { get; set; } = string.Empty;
        public float Score { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AuctionItemSummaryDto
    {
        public int ID { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string OwnerName { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
