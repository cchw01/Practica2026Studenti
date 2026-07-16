namespace Backend.Models
{
    public class CategoryItem
    {
        public int id { get; set; }
        public string name { get; set; }
        public List<AuctionItem> items { get; set; } = new();
    }
}
