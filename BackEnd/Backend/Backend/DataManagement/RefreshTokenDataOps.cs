using Backend.Models;
using System.Security.Cryptography;
namespace Backend.DataManagement
{
    public class RefreshTokenDataOps
    {
        private readonly ApplicationDbContext dbContext;
        const double DAYS_TO_ADD = 30;
        public RefreshTokenDataOps(ApplicationDbContext context)
        {
            dbContext = context;
        }

        public void CreateRefreshToken(User user)
        {
            var token = dbContext?.RefreshTokens.Where(x => x.UserId == user.ID).FirstOrDefault();
            if(token != null && token.ExpiresAt < DateTime.Now)
            {
                DeleteRefreshToken(user);
            }
            if (token == null || token.ExpiresAt < DateTime.Now)
            {
                RefreshToken newToken = new RefreshToken();
                newToken.Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                newToken.UserId = user.ID;
                newToken.CreatedAt = DateTime.Now;
                newToken.ExpiresAt = newToken.CreatedAt.AddDays(DAYS_TO_ADD);
                dbContext?.RefreshTokens.Add(newToken);
                dbContext?.SaveChanges();
            }
        }
        public void DeleteRefreshToken(User user)
        {
            var token = dbContext?.RefreshTokens.Where(x => x.UserId == user.ID).FirstOrDefault();
            if(token != null)
            {
                dbContext?.RefreshTokens.Remove(token);
                dbContext?.SaveChanges();
            }
        }
        public RefreshToken? GetRefreshToken(User user)
        {
            return dbContext?.RefreshTokens.Where(x => x.UserId == user.ID).FirstOrDefault();
        }
    }
}