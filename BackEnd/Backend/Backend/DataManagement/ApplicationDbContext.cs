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
        public DbSet<Bid> Bids => Set<Bid>();
        public DbSet<CategoryItem> Category => Set<CategoryItem>();
        public DbSet<ForumPost> ForumPosts => Set<ForumPost>();
        
        public DbSet<ForumComment> ForumComments => Set<ForumComment>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<ProfilePicture> ProfilePictures => Set<ProfilePicture>(); 
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

            modelBuilder.Entity<AuctionItem>() // Relatie Item -> (wishlist) -> user
                .HasMany(i => i.WishingUsers)
                .WithMany(u => u.WishList);

            modelBuilder.Entity<Bid>() // Bid -> User
                .HasOne(b => b.Bidder)
                .WithMany(u => u.BidList)
                .HasForeignKey(b => b.BidderId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Bid>() // Bid -> Item
                .HasOne(b => b.BiddedItem)
                .WithMany(i => i.BidList)
                .HasForeignKey(b => b.BiddedItemId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ForumPost>() // ForumPost -> ForumComment
                .HasMany(p => p.Comments)
                .WithOne(i => i.ForumPost)
                .HasForeignKey(b => b.ForumPostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ForumPost>() // ForumPost -> User
              .HasOne(p => p.User)
              .WithMany(i => i.ForumPosts)
              .HasForeignKey(b => b.UserId)
              .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ForumComment>() // ForumComment -> User
              .HasOne(p => p.User)
              .WithMany(i => i.ForumComments)
              .HasForeignKey(b => b.UserId)
              .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Notification>() //Notification ->User
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AuctionItem>()
                .Property(a => a.StartPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<AuctionItem>()
                .Property(a => a.CurrentPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bid>()
                .Property(b => b.Price)
                .HasPrecision(18, 2);
        }
    }
}