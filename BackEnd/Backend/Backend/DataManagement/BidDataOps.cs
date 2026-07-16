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
            DbContext.Bids.Add(bid);
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
