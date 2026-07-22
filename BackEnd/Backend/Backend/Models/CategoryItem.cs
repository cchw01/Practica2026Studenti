using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class CategoryItem
    {
        public int id { get; set; }

        [Required]
        [MaxLength(100)]
        public string name { get; set; } = string.Empty;
            
        [MaxLength(500)]
        public string? description { get; set; } = string.Empty;

        [JsonIgnore]
        public List<AuctionItem> items { get; set; } = new();
    }
}
