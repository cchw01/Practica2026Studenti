using Backend.Models;

namespace Backend.DataManagement
{
    public class SupportMessageDataOps
    {
        private readonly ApplicationDbContext DbContext;
        public SupportMessageDataOps(ApplicationDbContext context) { DbContext = context; }

        public void Create(SupportMessage msg)
        {
            DbContext.SupportMessages.Add(msg);
            DbContext.SaveChanges();
        }

        public List<SupportMessage> GetBySource(string source) =>
            DbContext.SupportMessages
                .Where(m => m.Source == source)
                .OrderByDescending(m => m.CreatedAt)
                .ToList();

        public void ResolveWithReply(int id, string? replyMessage)
        {
            var msg = DbContext.SupportMessages.Find(id);
            if (msg == null) throw new Exception("Mesajul nu a fost gasit");

            msg.IsResolved = true;
            DbContext.SaveChanges();

            if (!string.IsNullOrWhiteSpace(replyMessage) && msg.UserId.HasValue)
            {
                var notifOps = new NotificationDataOps(DbContext);
                notifOps.Create(msg.UserId.Value, $"Răspuns la mesajul tău: {replyMessage}");
            }
        }
    }
}