using Backend.UserSpace;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class User
    {
    
        public string id { get; set; }

        
        public string userName { get; set; }

        
        public string name { get; set; }

        
        public string email { get; set; }

       
        public RoleEnum roleEnum { get; set; }

        // 6. Password - hashed, folosit doar in DB, nu trebuie expus catre UI/API
        [JsonIgnore]
        //public string Password { get; set; }

        //Listele de item sunt acum implementate
        public List<AuctionItem> addedItemList { get; set; } = new List<AuctionItem>();


        public List<AuctionItem> biddedItemList { get; set; } = new List<AuctionItem>();


        public List<AuctionItem> whishlist { get; set; } = new List<AuctionItem>();


        public float rating { get; private set; }

        
        public string reviewList { get; set; }



       
    }
}





    

