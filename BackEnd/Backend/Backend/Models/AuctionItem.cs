using System.Globalization;
using System.Text.Json.Serialization;

namespace Backend.Models
{

    public class AuctionItem
    {
        public int ID { get; set; }

        public string Name { get; set; } = string.Empty;
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public CategoryItem? Category { get; set; }

        public int CategoryId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum StatusEnum
        {
            Added,
            Validated,
            ActiveBid,
            NoWinner,
            Sold,
        }

        public List<User>? WishingUsers { get; set; }
        public string? Description { get; set; }

        public string Location { get; set; } = string.Empty;

        public User? Owner { get; set; }

        public int OwnerId { get; set; }

        public User? Winner { get; set; }

        public int? WinnerId { get; set; }

        public StatusEnum Status { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public List<Bid>? BidList { get; set; }
        public string? ImageUrl { get; set; }
        //Photolist here if needed



    }
}
