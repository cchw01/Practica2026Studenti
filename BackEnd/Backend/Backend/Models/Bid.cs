namespace Backend.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public User? Bidder { get; set; }
        public int BidderId { get; set; }
        public AuctionItem? BiddedItem { get; set; }
        public int BiddedItemId { get; set; }
        public decimal Price { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

    }
}
