using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.DataManagement
{
    public class UserDataOps
    {
        private readonly ApplicationDbContext DbContext;

        public UserDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }

        public User[] GetUsers()
        {
            return DbContext.Users.ToArray();
        }

        public User? GetUserById(int id)
        {
            var user = DbContext.Users
                .Where(x => x.ID == id)
                .FirstOrDefault();

            return user;
        }

        public void AddUser(User user)
        {
            DbContext.Users.Add(user);
            DbContext.SaveChanges();
        }

        public void UpdateUser(User user)
        {
            DbContext.Users.Update(user);
            DbContext.SaveChanges();
        }

        public void DeleteUser(int id)
        {
            var user = DbContext.Users
                .Where(x => x.ID == id)
                .FirstOrDefault();

            if (user != null)
            {
                DbContext.Users.Remove(user);
                DbContext.SaveChanges();
            }
        }
        public User? GetUserByUsername(string userName)
        {
            var user = DbContext.Users
                .Where(x => x.UserName == userName)
                .FirstOrDefault();

            return user;
        }
        public User? GetUserByEmail(string email)
        {
            var user = DbContext.Users
                .Where(x => x.Email == email)
                .FirstOrDefault(); 
            return user;
        }

        public bool AddToWishlist(int userId, int itemId)
        {
            var user = DbContext.Users
                .Include(u => u.WishList)
                .FirstOrDefault(u => u.ID == userId);

            var item = DbContext.AuctionItems
                .FirstOrDefault(i => i.ID == itemId);

            if (user == null || item == null)
                return false;

            if (user.WishList.Any(i => i.ID == itemId))
                return false;

            user.WishList.Add(item);
            DbContext.SaveChanges();

            return true;
        }

        public AuctionItem[]? GetWishlist(int userId)
        {
            var user = DbContext.Users
                .Include(u => u.WishList)
                .FirstOrDefault(u => u.ID == userId);

            if (user == null)
                return null;

            return user.WishList.ToArray();
        }

        public bool RemoveFromWishlist(int userId, int itemId)
        {
            var user = DbContext.Users
                .Include(u => u.WishList)
                .FirstOrDefault(u => u.ID == userId);

            if (user == null)
                return false;

            var item = user.WishList
                .FirstOrDefault(i => i.ID == itemId);

            if (item == null)
                return false;

            user.WishList.Remove(item);
            DbContext.SaveChanges();

            return true;
        }
    }
}