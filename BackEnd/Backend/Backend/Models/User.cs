using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class User
    {
        public int ID { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public RoleEnum Role { get; set; }

        [JsonIgnore]
        public string? Password { get; set; }


        public List<AuctionItem> AddedItemsList { get; set; } = new();

        public int AddedItemsListId { get; set; }

        public List<AuctionItem> BiddedItemsList { get; set; } = new();

        public List<AuctionItem> WonItemsList { get; set; } = new();

        public List<AuctionItem> WhishList { get; set; } = new();

        public float Rating { get; private set; }

        public List<Review> ReviewList { get; set; } = new();

        public User()
        {
        }

        public User(
            int id,
            string userName,
            string name,
            string email,
            RoleEnum role)
        {
            ID = id;
            UserName = userName;
            Name = name;
            Email = email;
            Role = role;
        }
    }
}