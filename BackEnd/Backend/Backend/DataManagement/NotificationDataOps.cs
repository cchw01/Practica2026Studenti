using Backend.Models;
using System.Text.Json;

namespace Backend.DataManagement
{
    public class NotificationDataOps
    {
        private readonly ApplicationDbContext DbContext;
        public NotificationDataOps(ApplicationDbContext context) { DbContext = context; }

        public List<Notification> GetForUser(int userId)
        {
            var list = DbContext.Notifications.Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToList();

            foreach (var n in list)
            {
                n.CreatedAt = DateTime.SpecifyKind(n.CreatedAt, DateTimeKind.Utc);
            }

            return list;
        }

        public bool HasUnread(int userId) =>
            DbContext.Notifications.Any(n => n.UserId == userId && !n.IsRead);
        public int GetUnreadCount(int userId) =>
    DbContext.Notifications.Count(n => n.UserId == userId && !n.IsRead);

        public void MarkAsRead(int id)
        {
            var n = DbContext.Notifications.Find(id);
            if (n != null) { n.IsRead = true; DbContext.SaveChanges(); }
        }
        public void MarkAllAsRead(int userId)
        {
            var unread = DbContext.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToList();

            foreach (var n in unread)
                n.IsRead = true;

            DbContext.SaveChanges();
        }
        public void Create(int userId, string message)
        {
            DbContext.Notifications.Add(new Notification { UserId = userId, Message = message });
            DbContext.SaveChanges();

        }
        public void Create(int userId, string type, object paramsObj)
        {
            var payload = JsonSerializer.Serialize(new { type, @params = paramsObj });
            DbContext.Notifications.Add(new Notification { UserId = userId, Message = payload });
            DbContext.SaveChanges();
        }
    }
}
