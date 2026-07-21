using System;
using System.Linq;
using Backend.Models;

namespace Backend.DataManagement
{
    public static class DbInitializer
    {
        public static void Seed(ApplicationDbContext db)
        {
            // 1. Seed Categories if empty
            if (!db.Category.Any())
            {
                db.Category.AddRange(
                    new CategoryItem { name = "Vehicles" },
                    new CategoryItem { name = "Electronics" },
                    new CategoryItem { name = "Art" },
                    new CategoryItem { name = "Clothing" },
                    new CategoryItem { name = "Home & Garden" },
                    new CategoryItem { name = "Real Estate" }
                );
                db.SaveChanges();
            }

            // 2. Ensure test user exists
            if (!db.Users.Any())
            {
                db.Users.Add(new User(
                    id: 0,
                    userName: "alex.popescu",
                    name: "Alex Popescu",
                    email: "alex@example.com",
                    role: RoleEnum.User,
                    phoneNumber: "0712345678"
                ));
                db.SaveChanges();
            }

            var defaultUser = db.Users.First();
            var categories = db.Category.ToList();

            var catVehicles = categories.FirstOrDefault(c => c.name == "Vehicles") ?? categories.First();
            var catElectronics = categories.FirstOrDefault(c => c.name == "Electronics") ?? categories.First();
            var catArt = categories.FirstOrDefault(c => c.name == "Art") ?? categories.First();
            var catClothing = categories.FirstOrDefault(c => c.name == "Clothing") ?? categories.First();
            var catRealEstate = categories.FirstOrDefault(c => c.name == "Real Estate") ?? categories.First();

            // 3. Seed AuctionItems if empty
            if (!db.AuctionItems.Any())
            {
                db.AuctionItems.AddRange(
                    new AuctionItem
                    {
                        Name = "Vintage Leather Jacket",
                        StartPrice = 150.00m,
                        CurrentPrice = 180.00m,
                        CategoryId = catClothing.id,
                        Description = "An authentic vintage leather jacket in excellent condition with genuine brass zips and warm lining.",
                        Location = "Cluj-Napoca",
                        OwnerId = defaultUser.ID,
                        Status = AuctionItem.StatusEnum.Validated,
                        StartDate = DateTime.UtcNow.AddDays(-2),
                        EndDate = DateTime.UtcNow.AddDays(10),
                        ImageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop"
                    },
                    new AuctionItem
                    {
                        Name = "Antique Pocket Watch 1920s",
                        StartPrice = 500.00m,
                        CurrentPrice = 550.00m,
                        CategoryId = catArt.id,
                        Description = "A handcrafted antique pocket watch from the 1920s in fully functional working condition.",
                        Location = "București",
                        OwnerId = defaultUser.ID,
                        Status = AuctionItem.StatusEnum.Validated,
                        StartDate = DateTime.UtcNow.AddDays(-1),
                        EndDate = DateTime.UtcNow.AddDays(7),
                        ImageUrl = "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop"
                    },
                    new AuctionItem
                    {
                        Name = "BMW 3 Series 2021 M-Sport",
                        StartPrice = 15000.00m,
                        CurrentPrice = 16200.00m,
                        CategoryId = catVehicles.id,
                        Description = "Full service history, accident-free, luxury interior package, heated seats, ambient lighting, and panoramic roof.",
                        Location = "Bucharest",
                        OwnerId = defaultUser.ID,
                        Status = AuctionItem.StatusEnum.Validated,
                        StartDate = DateTime.UtcNow.AddDays(-3),
                        EndDate = DateTime.UtcNow.AddDays(14),
                        ImageUrl = "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop"
                    },
                    new AuctionItem
                    {
                        Name = "Apple iPhone 15 Pro Max 256GB",
                        StartPrice = 900.00m,
                        CurrentPrice = 950.00m,
                        CategoryId = catElectronics.id,
                        Description = "Brand new in factory sealed box. Natural Titanium color, international warranty included.",
                        Location = "Timișoara",
                        OwnerId = defaultUser.ID,
                        Status = AuctionItem.StatusEnum.Validated,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddDays(5),
                        ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop"
                    },
                    new AuctionItem
                    {
                        Name = "Modern Penthouse Apartment",
                        StartPrice = 250000.00m,
                        CurrentPrice = 255000.00m,
                        CategoryId = catRealEstate.id,
                        Description = "Stunning 3-bedroom luxury penthouse with panoramic city view, underground parking, and smart home automation.",
                        Location = "Cluj-Napoca",
                        OwnerId = defaultUser.ID,
                        Status = AuctionItem.StatusEnum.Validated,
                        StartDate = DateTime.UtcNow.AddDays(-4),
                        EndDate = DateTime.UtcNow.AddDays(20),
                        ImageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop"
                    }
                );
                db.SaveChanges();
            }
        }
    }
}
