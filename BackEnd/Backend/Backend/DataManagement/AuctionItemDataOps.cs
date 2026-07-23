using Backend.DataManagement; 
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;


namespace Backend.DataManagement
{
    public class AuctionItemDataOps
    {
        private readonly ApplicationDbContext dbContext;

        public AuctionItemDataOps(ApplicationDbContext context)
        {
            dbContext = context;
        }

        public AuctionItem[] GetAuctionItems()
        {
            return dbContext.AuctionItems
                .AsNoTracking()
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.Winner)
                .ToArray();
        }

        public AuctionItem[] GetActiveAuctionItems()
        {
            var now = DateTime.Now;
            return dbContext.AuctionItems
                .AsNoTracking()
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.Winner)
                .Where(i =>
                    (i.Status == AuctionItem.StatusEnum.Validated ||
                     i.Status == AuctionItem.StatusEnum.ActiveBid) &&
                    i.EndDate > now)
                .OrderBy(i => i.EndDate)
                .ToArray();
        }

        public void AddAuctionItem(AuctionItem item)
        {
            dbContext?.AuctionItems.Add(item);
            dbContext?.SaveChanges();
        }

      

        public bool DeleteAuctionItem(int id)
        {
            var item = dbContext.AuctionItems
                .FirstOrDefault(i => i.ID == id);

            if (item == null)
                return false;

            dbContext.AuctionItems.Remove(item);
            dbContext.SaveChanges();

            return true;
        }

        public AuctionItem? GetAuctionItemById(int id)
        {
            var item = dbContext.AuctionItems
                .AsNoTracking()
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.Winner)
                .FirstOrDefault(x => x.ID == id);
            return item;
        }

        public AuctionItem? GetTrackedAuctionItemById(int id)
        {
            var item = dbContext.AuctionItems
                .FirstOrDefault(i => i.ID == id);

            return item;
        }

        public bool HasBids(int itemId)
        {
            return dbContext.Bids.Any(
                bid => bid.BiddedItemId == itemId);
        }

        public void SaveChanges()
        {
            dbContext.SaveChanges();
        }

        public void ProcessAuctionEnd(AuctionItem item, BidDataOps bidDataOps)
        {
            if (item.Status == AuctionItem.StatusEnum.Sold ||
                item.Status == AuctionItem.StatusEnum.NoWinner ||
                item.Status == AuctionItem.StatusEnum.Rejected)
            {
                return;
            }
            item.EndDate = DateTime.Now;

            var bids = bidDataOps.GetBidsByItemId(item.ID);
            if (bids != null && bids.Length > 0)
            {
                var highestBid = bids.OrderByDescending(b => b.Price).First();
                item.Status = AuctionItem.StatusEnum.Sold;
                item.WinnerId = highestBid.BidderId;
            }
            else
            {
                item.Status = AuctionItem.StatusEnum.NoWinner;
            }
            dbContext.SaveChanges();
        }
    }
}