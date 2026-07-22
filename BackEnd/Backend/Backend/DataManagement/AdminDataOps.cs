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

        public List<object> GetAllUsers()
        {
            var reportCounts = DbContext.Reports
                .Where(r => r.TargetType == ReportTargetType.User && r.ReportedUserId != null)
                .GroupBy(r => r.ReportedUserId)
                .Select(g => new { UserId = g.Key!.Value, Count = g.Count() })
                .ToDictionary(x => x.UserId, x => x.Count);

            return DbContext.Users.ToList().Select(u => new
            {
                u.ID,
                u.UserName,
                u.Name,
                u.Email,
                u.Role,
                u.Rating,
                u.IsBanned,
                Reports = reportCounts.TryGetValue(u.ID, out var count) ? count : 0
            }).ToList<object>();
        }

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
    DbContext.AuctionItems
        .Include(a => a.Owner)
        .Where(a => a.Status == AuctionItem.StatusEnum.Added)
        .ToList();

        public void SetAuctionStatus(int itemId, AuctionItem.StatusEnum status)
        {
            var item = DbContext.AuctionItems.Find(itemId);
            if (item == null) throw new Exception("Item not found");

            bool statusChanged = item.Status != status;

            item.Status = status;
            DbContext.SaveChanges();

            if (!statusChanged) return;

            var notifOps = new NotificationDataOps(DbContext);

            if (status == AuctionItem.StatusEnum.Validated)
            {
                notifOps.Create(item.OwnerId, "AuctionApproved", new { itemName = item.Name });
            }
            else if (status == AuctionItem.StatusEnum.Rejected)
            {
                notifOps.Create(item.OwnerId, "AuctionRejected", new { itemName = item.Name });
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