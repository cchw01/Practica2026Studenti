using System.Globalization;
using System.Text.Json.Serialization;

namespace Backend.Models
{

    public class AuctionItem
    {
        public int ID { get; set; }

<<<<<<< HEAD
        public string Name { get; set; }

=======
        public string Name { get; set; } = string.Empty;
>>>>>>> ac1cf0e7929a56e7ae04d9849f400fe098d0475f
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public CategoryItem? Category { get; set; }

<<<<<<< HEAD
        public string Category {get;set; } //TODO IMPLEMENT CATEGORY CLASS
=======
        public int CategoryId { get; set; }
>>>>>>> ac1cf0e7929a56e7ae04d9849f400fe098d0475f

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum StatusEnum
        {
            Added,
            Validated,
            ActiveBid,
            NoWinner,
            Sold,
            Rejected,
        }

        public List<User>? WishingUsers { get; set; }
        public string? Description { get; set; }

        public string Location { get; set; } = string.Empty;

<<<<<<< HEAD
        public string Owner{get;set; } //TODO IMPLEMENT USER CLASS
=======
        public User? Owner { get; set; }
>>>>>>> ac1cf0e7929a56e7ae04d9849f400fe098d0475f

        public string? Winner { get; set; } //TO DO IMPLEMENT USER CLASS

        public StatusEnum Status { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public List<Bid>? BidList { get; set; }
        public string? ImageUrl { get; set; }
        //Photolist here if needed



    }
}
