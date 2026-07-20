using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class BidDto
    {
        public int Id { get; set; }
        public int AuctionItemId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime Date { get; set; }
    }

    public class CreateBidDto
    {
        [Required]
        public int AuctionItemId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }
    }
}
