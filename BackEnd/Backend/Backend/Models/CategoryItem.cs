using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class CategoryItem
    {
        public int id { get; set; }
<<<<<<< HEAD
        public string name { get; set; }
        public string items { get; set; }// List<item>
=======

        [Required]
        [MaxLength(100)]
        public string name { get; set; } = string.Empty;
            
        [MaxLength(500)]
        public string? description { get; set; } = string.Empty;

        [JsonIgnore]
        public List<AuctionItem> items { get; set; } = new();
>>>>>>> ac1cf0e7929a56e7ae04d9849f400fe098d0475f
    }
}
