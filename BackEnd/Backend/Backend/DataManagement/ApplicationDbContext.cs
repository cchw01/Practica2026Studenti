using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.DataManagement
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<AuctionItem> AuctionItems => Set<AuctionItem>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<CategoryItem> Category => Set<CategoryItem>();
        public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
        protected override void OnConfiguring(
            DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(
                @"Server=(localdb)\MSSQLLocalDB;Database=AuctionApplicationDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(s => s.ReviewList)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}