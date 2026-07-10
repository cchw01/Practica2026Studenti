using System.Text.Json.Serialization;


namespace Backend.Models
{


    public class AuctionItem
    {
        public int ID { get; set; }

        public string Name { get; set; }

        public decimal StartPrice { get; set; }

        public decimal CurrentPrice { get; set; }

        public string Category {get;set; } //TODO IMPLEMENT CATEGORY CLASS

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum StatusEnum
        {
            Added,
            Validated,
            ActiveBid,
            NoWinner,
            Sold,

        }

        public string? Description { get; set; }

        public string Location { get; set; }

        public string Owner{get;set; } //TODO IMPLEMENT USER CLASS

        public string? Winner { get; set; } //TO DO IMPLEMENT USER CLASS

        public StatusEnum Status { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
        
        //Photolist here if needed



     }
}
