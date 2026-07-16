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
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.Winner)
                .Include(i => i.BidList)
                .ToArray();
        }

        public void AddAuctionItem(AuctionItem item)
        {
            dbContext?.AuctionItems.Add(item);
            dbContext?.SaveChanges();
        }

        public void UpdateAuctionItem(AuctionItem item)
        {
            try
            {
                dbContext?.AuctionItems.Update(item);
                dbContext?.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message); // TODO look into this, reportedly might cause stack trace issues
            }
        }

        public void DeleteAuctionItem(int id)
        {
            try
            {
                var item = dbContext.AuctionItems.Where(x => x.ID == id).FirstOrDefault();
                
                if (item != null)
                {
                    dbContext.AuctionItems.Remove(item);
                    dbContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message); // TODO look into this, reportedly might cause stack trace issues
            }
        }

        public AuctionItem? GetAuctionItemById(int id)
        {
            return dbContext.AuctionItems
                .Include(i => i.Category)
                .Include(i => i.Owner)
                .Include(i => i.Winner)
                .Include(i => i.BidList)
                    .ThenInclude(b => b.Bidder)
                .FirstOrDefault(x => x.ID == id);
        }

        
    }
}