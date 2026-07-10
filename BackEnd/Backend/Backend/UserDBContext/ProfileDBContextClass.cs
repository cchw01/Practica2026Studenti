using Backend.Models;
using Backend.UserSpace;
using Microsoft.EntityFrameworkCore;

namespace Backend.UserDBContext
{
    public class ProfileDBContextClass : DbContext
    {
        public ProfileDBContextClass(DbContextOptions<ProfileDBContextClass> options)
            : base(options)
        {
        }

        // --- DbSets ---
        public DbSet<User> Users { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<AuctionItem> AuctionItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.id);
                entity.Property(u => u.userName).IsRequired().HasMaxLength(50);
                entity.Property(u => u.name).IsRequired().HasMaxLength(100);
                entity.Property(u => u.email).IsRequired().HasMaxLength(150);
                entity.HasIndex(u => u.userName).IsUnique();
                entity.HasIndex(u => u.email).IsUnique();

                // Ignore string-based navigation fields (not mapped as columns)
                entity.Ignore(u => u.addedItemsList);
                entity.Ignore(u => u.biddedItemsList);
                entity.Ignore(u => u.whishList);
                entity.Ignore(u => u.reviewList);
                entity.Ignore(u => u.roleEnum);
            });

            // Review
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Score).IsRequired();
                entity.Property(r => r.Comment).HasMaxLength(1000);
                entity.Property(r => r.CreatedAt).IsRequired();
            });

            // AuctionItem
            modelBuilder.Entity<AuctionItem>(entity =>
            {
                entity.HasKey(a => a.ID);
                entity.Property(a => a.Name).IsRequired().HasMaxLength(200);
                entity.Property(a => a.StartPrice).HasColumnType("decimal(18,2)");
                entity.Property(a => a.CurrentPrice).HasColumnType("decimal(18,2)");
                entity.Property(a => a.Status).HasConversion<string>();
            });
        }
    }
}
