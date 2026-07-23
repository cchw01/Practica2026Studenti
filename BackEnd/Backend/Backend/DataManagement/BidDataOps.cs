using Backend.Models;
using Backend.DataManagement;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

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
            return DbContext.Bids
                .AsNoTracking()
                .Include(b => b.Bidder)
                .Include(b => b.BiddedItem)
                .ToArray();
        }

        public Bid? GetBidById(int id)
        {
            var bid = DbContext.Bids
                .AsNoTracking()
                .Include(b => b.Bidder)
                .Include(b => b.BiddedItem)
                .Where(x => x.Id == id)
                .FirstOrDefault();

            return bid;
        }

        public void AddBid(Bid bid)
        {
            DbContext.Bids.Add(bid);
            DbContext.SaveChanges();
        }

        public void DeleteBid(int id)
        {
            var bid = DbContext.Bids
                .Where(x => x.Id == id)
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
                .AsNoTracking()
                .Include(b => b.Bidder)
                .Include(b => b.BiddedItem)
                .Where(x => x.BiddedItemId == itemId)
                .OrderByDescending(x => x.Date)
                .ToArray();
        }
        public Bid? GetHighestBidByItemId(int itemId)
        {
            return DbContext.Bids
                .AsNoTracking()
                .Where(b => b.BiddedItemId == itemId)
                .OrderByDescending(b => b.Price)
                .ThenByDescending(b => b.Date)
                .FirstOrDefault();
        }
    }
}
