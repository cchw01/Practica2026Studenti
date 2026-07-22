using Backend.Models;
using Backend.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.DataManagement
{
    public static class DbSeeder
    {
        public static void Seed(ApplicationDbContext context)
        {
            // 1. Ne asigurăm că baza de date este creată
            context.Database.EnsureCreated();

            // 2. Populare Categorii (dacă nu există deja)
            if (!context.Category.Any())
            {
                var categories = new List<CategoryItem>
                {
                    new CategoryItem { name = "Electrocasnice" },
                    new CategoryItem { name = "Imobiliare" },
                    new CategoryItem { name = "Auto & Moto" },
                    new CategoryItem { name = "Modă & Accesorii" },
                    new CategoryItem { name = "Sport & Outdoor" },
                    new CategoryItem { name = "Altele" }
                };

                context.Category.AddRange(categories);
                context.SaveChanges();
            }

            // 3. Populare Utilizatori de test (dacă nu există deja)
            if (!context.Users.Any())
            {
                var users = new List<User>
                {
                    new User
                    {
                        UserName = "admin",
                        Name = "Administrator Sistem",
                        Email = "admin@licitatie.ro",
                        Password = PasswordHasher.HashPassword("Admin123!"),
                        Role = RoleEnum.Admin
                    },
                    new User
                    {
                        UserName = "andrei_popescu",
                        Name = "Andrei Popescu",
                        Email = "andrei@licitatie.ro",
                        Password = PasswordHasher.HashPassword("Andrei123!"),
                        Role = RoleEnum.User
                    },
                    new User
                    {
                        UserName = "maria_ionescu",
                        Name = "Maria Ionescu",
                        Email = "maria@licitatie.ro",
                        Password = PasswordHasher.HashPassword("Maria123!"),
                        Role = RoleEnum.User
                    }
                };

                context.Users.AddRange(users);
                context.SaveChanges();
            }

            // 4. Populare Licitații (dacă nu există deja)
            if (!context.AuctionItems.Any())
            {
                var owner = context.Users.First(u => u.UserName == "andrei_popescu");
                var category = context.Category.First(c => c.name == "Electrocasnice");

                var items = new List<AuctionItem>
                {
                    new AuctionItem
                    {
                        Name = "Televizor Smart 4K UltraHD LED 138cm",
                        StartPrice = 1200,
                        CurrentPrice = 1200,
                        CategoryId = category.id,
                        Description = "Televizor în stare perfectă de funcționare, folosit doar 6 luni. Vine în cutia originală cu telecomanda smart.",
                        Location = "București",
                        OwnerId = owner.ID,
                        Status = AuctionItem.StatusEnum.ActiveBid,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddDays(7)
                    },
                    new AuctionItem
                    {
                        Name = "Bicicletă Mountain Bike Rockrider",
                        StartPrice = 850,
                        CurrentPrice = 850,
                        CategoryId = context.Category.First(c => c.name == "Sport & Outdoor").id,
                        Description = "Bicicletă pentru adulți, suspensie față, 21 de viteze, frâne pe disc. Prezintă mici urme de uzură.",
                        Location = "Brașov",
                        OwnerId = owner.ID,
                        Status = AuctionItem.StatusEnum.ActiveBid,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddDays(5)
                    }
                };

                context.AuctionItems.AddRange(items);
                context.SaveChanges();
            }

            // 5. Populare Forum (dacă nu există deja)
            if (!context.ForumPosts.Any())
            {
                var user = context.Users.First(u => u.UserName == "maria_ionescu");

                var posts = new List<ForumPost>
                {
                    new ForumPost
                    {
                        Title = "Reguli pentru licitatori noi?",
                        Description = "Bună! Sunt nouă pe această platformă și aș vrea să știu ce se întâmplă dacă câștig o licitație dar nu mai pot cumpăra produsul. Există penalizări?",
                        UserId = user.ID,
                        Date = DateTime.UtcNow.AddHours(-5)
                    }
                };

                context.ForumPosts.AddRange(posts);
                context.SaveChanges();
            }
        }
    }
}
