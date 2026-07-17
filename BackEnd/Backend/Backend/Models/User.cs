using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class User
    {
        public int ID { get; set; }

        public string UserName { get; set; }

        public string Name { get; set; }

        public string Email { get; set; }

        public RoleEnum Role { get; set; }

        [JsonIgnore]
        public string? Password { get; set; }

        public string PhoneNumber { get; set; }


        public List<AuctionItem> AddedItemsList { get; set; } = new();

        public List<Bid> BidList { get; set; } = new();

        public List<AuctionItem> WonItemsList { get; set; } = new();

        public List<AuctionItem> WishList { get; set; } = new();

        public float Rating { get; private set; }

        public List<Review> ReviewList { get; set; } = new();
        public List<ForumPost> ForumPosts { get; set; } = new();
        public List<ForumComment> ForumComments { get; set; } = new();
        public bool IsBanned { get; set; } = false;



        public User() { }

        public User(
            int id,
            string userName,
            string name,
            string email,
            RoleEnum role,
            string phoneNumber)
        {
            ID = id;
            UserName = userName;
            Name = name;
            Email = email;
            Role = role;
            PhoneNumber = phoneNumber;
        }
    }
}