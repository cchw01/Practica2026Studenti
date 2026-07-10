namespace Backend.Models
{
    public class CategoryItem
    {
        public int id { get; set; }
        public string? name { get; set; }
        public List<AuctionItem>  Items { get; set; } = new List<AuctionItem>();
    }
}
