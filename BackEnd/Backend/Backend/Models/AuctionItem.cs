namespace Backend.Models
{
    public class AuctionItem
    {
        public int ID { get; set; }


        public string Name { get; set; }


        public decimal StartPrice { get; set; }

        public decimal CurrentPrice { get; set; }


        //TO DO IMPLEMENT CATEGORY CLASS


        //public Category Category {get;set;}


        public string Description { get; set; }


        public string Location { get; set; }


        //TO DO IMPLEMENT USER CLASS


        //public User User{get;set;}

        //public User Winner { get; set; }

        public enum Status
        {
            Added,
            Validated,
            ActiveBid,
            NoWinner,
            Sold,

        }

        public DateTime StartDate;

        public DateTime EndDate;




        //TO ADD PHOTOLIST



     }
}
