using Backend.DataManagement; 
using Backend.Models;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

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
                .Include(x => x.Category)
                .Include(x => x.Owner)
                .Include(x => x.BidList)
                .ToArray();
        }

        public void AddAuctionItem(AuctionItem item)
        {
            dbContext?.AuctionItems.Add(item);
            dbContext?.SaveChanges();
        }

        public void UpdateAuctionItem(AuctionItem item)
        {
            dbContext?.AuctionItems.Update(item);
            dbContext?.SaveChanges();
        }

        public void DeleteAuctionItem(int id)
        {
            var item = dbContext.AuctionItems.Where(x => x.ID == id).FirstOrDefault();
            
            if (item != null)
            {
                dbContext.AuctionItems.Remove(item);
                dbContext.SaveChanges();
            }
        }

        public AuctionItem? GetAuctionItemById(int id)
        {
            return dbContext.AuctionItems
                .Include(x => x.Category)
                .Include(x => x.Owner)
                .Include(x => x.BidList)
                .Where(x => x.ID == id)
                .FirstOrDefault();
        }

        
    }
}