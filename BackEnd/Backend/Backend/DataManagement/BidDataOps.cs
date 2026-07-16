using Backend.Models;
using Backend.DataManagement;
using System;
using System.Linq;

namespace Backend.DataManagement
{
    public class BidDataOps
    {
        private readonly ApplicationDbContext DbContext;

        public BidDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }

        public Bid[] GetBids()
        {
            return DbContext.Bids.ToArray();
        }

        public Bid? GetBidById(int id)
        {
            var bid = DbContext.Bids
                .Where(x => x.id == id)
                .FirstOrDefault();

            return bid;
        }

        public void AddBid(Bid bid)
        {
            var item = DbContext.AuctionItems.FirstOrDefault(i => i.ID == bid.BiddedItemId);
            if (item == null)
            {
                throw new Exception("Bidded item not found.");
            }

            decimal minimumBid = item.CurrentPrice > 0 ? item.CurrentPrice : item.StartPrice;
            if (bid.price <= minimumBid)
            {
                throw new Exception($"Bid price must be higher than the current price of {minimumBid}.");
            }

            var checkDate = bid.date != default ? bid.date : DateTime.Now;
            if (checkDate < item.StartDate)
            {
                throw new Exception("The auction has not started yet.");
            }
            if (checkDate > item.EndDate)
            {
                throw new Exception("The auction has already ended.");
            }

            DbContext.Bids.Add(bid);
            item.CurrentPrice = bid.price;
            DbContext.SaveChanges();
        }

        public void UpdateBid(Bid bid)
        {
            DbContext.Bids.Update(bid);
            DbContext.SaveChanges();
        }

        public void DeleteBid(int id)
        {
            var bid = DbContext.Bids
                .Where(x => x.id == id)
                .FirstOrDefault();

            if (bid != null)
            {
                DbContext.Bids.Remove(bid);
                DbContext.SaveChanges();
            }
        }

        public Bid[] GetBidsByItemId(int itemId)
        {
            return DbContext.Bids
                .Where(x => x.BiddedItemId == itemId)
                .ToArray();
        }
    }
}
