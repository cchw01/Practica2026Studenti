//using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        // DbSet<AuctionItem> AuctionItems => Set<AuctionItem>();
        public DbSet<Review> Reviews => Set<Review>();

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
                .WithMany()
                .HasForeignKey(r => r.ReviewerId)
                .IsRequired();

            //modelBuilder.Entity<Review>()
            //    .HasOne(r => r.ReviewedUser)
            //    .WithMany(u => u.ReviewList)
            //    .HasForeignKey(r => r.ReviewedUserId)
            //    .OnDelete(DeleteBehavior.SetNull);
        }
    }


    }
