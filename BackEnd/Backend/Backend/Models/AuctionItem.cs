namespace Backend.Models
{

    public enum AuctionStatus
    {
        Added,
        Validated,
        ActiveBid,
        NoWinner,
        Sold,

    }


    public class AuctionItem
    {
        public int ID { get; set; }


        public string Name { get; set; }


        public decimal StartPrice { get; set; }

        public decimal CurrentPrice { get; set; }


        //TODO IMPLEMENT CATEGORY CLASS


        //public Category Category {get;set;}


        public string Description { get; set; }


        public string Location { get; set; }


        //TODO IMPLEMENT USER CLASS


        //public User User{get;set;}

        //public User Winner { get; set; }



        public AuctionStatus Status { get; set; }


        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }




        //TO ADD PHOTOLIST



     }
}
