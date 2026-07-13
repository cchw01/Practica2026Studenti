//using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
namespace Backend.DataManagement
{
    public class ApplicationDbContext : DbContext
    {
        // DbSet<AuctionItem> AuctionItems => Set<AuctionItem>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
        protected override void OnConfiguring(
            DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                @"Server=(localdb)\MSSQLLocalDB;Database=AuctionApplicationDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");
        }
    }
}