using Backend.Models;
using Backend.DataManagement;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Backend.DataManagement
{
    public class AdminDataOps
    {
        private readonly ApplicationDbContext DbContext;
        public AdminDataOps(ApplicationDbContext context) { DbContext = context; }

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

        public List<AuctionItem> GetAuctionsPendingValidation() =>
            DbContext.AuctionItems.Where(a => a.Status == AuctionItem.StatusEnum.Added).ToList();

        public void SetAuctionStatus(int itemId, AuctionItem.StatusEnum status)
        {
            var item = DbContext.AuctionItems.Find(itemId);
            if (item == null) throw new Exception("Item not found");

            item.Status = status;
            DbContext.SaveChanges();

            var notifOps = new NotificationDataOps(DbContext);

            if (status == AuctionItem.StatusEnum.Validated)
            {
                notifOps.Create(item.OwnerId, $"Licitația ta \"{item.Name}\" a fost aprobată și e acum vizibilă public!");
            }
            else if (status == AuctionItem.StatusEnum.Rejected)
            {
                notifOps.Create(item.OwnerId, $"Licitația ta \"{item.Name}\" a fost respinsă de un administrator.");
            }
        }

        public object GetStats()
        {
            return new
            {
                TotalUsers = DbContext.Users.Count(),
                BannedUsers = DbContext.Users.Count(u => u.IsBanned),
                TotalAuctions = DbContext.AuctionItems.Count(),
                PendingValidation = DbContext.AuctionItems.Count(a => a.Status == AuctionItem.StatusEnum.Added),
                ActiveAuctions = DbContext.AuctionItems.Count(a => a.Status == AuctionItem.StatusEnum.ActiveBid),
                TotalForumPosts = DbContext.ForumPosts.Count(),
                TotalBids = DbContext.Bids.Count(),
            };
        }
    }
}