using Backend.Models;

namespace Backend.DataManagement
{
    public class AdminDataOps
    {
        private readonly ApplicationDbContext DbContext;
        public AdminDataOps(ApplicationDbContext context) { DbContext = context; }

        // --- Users ---
        public List<User> GetAllUsers() => DbContext.Users.ToList();

        public void SetUserRole(int userId, RoleEnum role)
        {
            var user = DbContext.Users.Find(userId);
            if (user == null) throw new Exception("User not found");
            user.Role = role;
            DbContext.SaveChanges();
        }

        public void SetBanned(int userId, bool banned)
        {
            var user = DbContext.Users.Find(userId);
            if (user == null) throw new Exception("User not found");
            user.IsBanned = banned;
            DbContext.SaveChanges();
        }

        // --- Auctions ---
        public void SetAuctionStatus(int itemId, AuctionItem.StatusEnum status)
        {
            var item = DbContext.AuctionItems.Find(itemId);
            if (item == null) throw new Exception("Item not found");
            item.Status = status;
            DbContext.SaveChanges();
        }

        // --- Forum moderation ---
        public void DeleteForumPost(int id)
        {
            var post = DbContext.ForumPosts.Find(id);
            if (post != null) { DbContext.ForumPosts.Remove(post); DbContext.SaveChanges(); }
        }

        public void DeleteForumComment(int id)
        {
            var comment = DbContext.ForumComments.Find(id);
            if (comment != null) { DbContext.ForumComments.Remove(comment); DbContext.SaveChanges(); }
        }

        // --- Stats ---
        public object GetStats()
        {
            return new
            {
                TotalUsers = DbContext.Users.Count(),
                BannedUsers = DbContext.Users.Count(u => u.IsBanned),
                TotalAuctions = DbContext.AuctionItems.Count(),
                ActiveAuctions = DbContext.AuctionItems.Count(a => a.Status == AuctionItem.StatusEnum.ActiveBid),
                PendingValidation = DbContext.AuctionItems.Count(a => a.Status == AuctionItem.StatusEnum.Added),
                TotalForumPosts = DbContext.ForumPosts.Count(),
                TotalBids = DbContext.Bids.Count(),
            };
        }
    }
}