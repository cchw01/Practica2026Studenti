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
            return dbContext.AuctionItems.Include(x => x.Category).ToArray();
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
            var item = dbContext.AuctionItems.Include(x => x.Category).Where(x => x.ID == id).FirstOrDefault();
            return item;
        }

        
    }
}