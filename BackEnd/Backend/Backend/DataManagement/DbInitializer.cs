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
        }
    }
}
