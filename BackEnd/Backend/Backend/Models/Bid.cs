namespace Backend.Models
{
    public class Bid
    {
        public int id { get; set; }
        public User? Bidder { get; set; }
        public int BidderId { get; set; }
        public AuctionItem? BiddedItem { get; set; }
        public int BiddedItemId { get; set; }
        public decimal price { get; set; }
        public DateTime date { get; set; }

    }
}
