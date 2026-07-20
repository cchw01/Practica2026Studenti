using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AuctionItemWithImageRequest
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public decimal StartPrice { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public string? Description { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public int DurationDays { get; set; }

        public IFormFile? Image { get; set; }
    }
}
