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

        public void SaveChanges()
        {
            dbContext.SaveChanges();
        }

    }
}