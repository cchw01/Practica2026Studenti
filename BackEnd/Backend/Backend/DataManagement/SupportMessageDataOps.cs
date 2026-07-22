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

        public List<SupportMessage> GetBySource(string source)
        {
            var list = DbContext.SupportMessages
                .Where(m => m.Source == source)
                .OrderByDescending(m => m.CreatedAt)
                .ToList();

            foreach (var m in list)
            {
                m.CreatedAt = DateTime.SpecifyKind(m.CreatedAt, DateTimeKind.Utc);
            }

            return list;
        }

        public void ResolveWithReply(int id, string? replyMessage)
        {
            var msg = DbContext.SupportMessages.Find(id);
            if (msg == null) throw new Exception("Mesajul nu a fost gasit");

            msg.IsResolved = true;
            DbContext.SaveChanges();

            if (!string.IsNullOrWhiteSpace(replyMessage) && msg.UserId.HasValue)
            {
                var notifOps = new NotificationDataOps(DbContext);

                var dateText = msg.CreatedAt.ToString("dd MMM yyyy");
                var issueText = !string.IsNullOrWhiteSpace(msg.IssueType) ? $" legat de „{msg.IssueType}”" : "";

                var notificationText =
                    $"Un administrator ți-a răspuns la mesajul din data de {dateText}{issueText}: {replyMessage}";

                notifOps.Create(msg.UserId.Value, notificationText);
            }
        }
    }
}