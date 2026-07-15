using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.DataManagement
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<AuctionItem> AuctionItems => Set<AuctionItem>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<CategoryItem> Category => Set<CategoryItem>();
        public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<ForumComment> ForumComments => Set<ForumComment>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Review>() // Relatie Review -> Reviewer
                .HasOne(r => r.Reviewer)
                .WithMany(s => s.ReviewList)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AuctionItem>() // Relatiee Item -> Categorie
                .HasOne(i => i.Category)
                .WithMany(c => c.items)
                .HasForeignKey(i => i.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AuctionItem>() // Relatie Item -> Owner
                .HasOne(i => i.Owner)
                .WithMany(o => o.AddedItemsList)
                .HasForeignKey(i => i.OwnerId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AuctionItem>() // Relatie Item -> Winner
                .HasOne(i => i.Winner)
                .WithMany(w => w.WonItemsList)
                .HasForeignKey(i => i.WinnerId)
                .OnDelete(DeleteBehavior.NoAction);
           

        }
    }
}