using System;

namespace Backend.DTOs
{
    public class BidDto
    {
        public int Id { get; set; }
        public int AuctionItemId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string ItemName { get; set; }
        public decimal Price { get; set; }
        public DateTime Date { get; set; }
    }

    public class CreateBidDto
    {
        public int AuctionItemId { get; set; }
        public decimal Price { get; set; }
    }
}
