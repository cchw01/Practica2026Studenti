using Backend.Data;
using Backend.Models;

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
    }
}