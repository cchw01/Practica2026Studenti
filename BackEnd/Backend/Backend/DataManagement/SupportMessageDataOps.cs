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
            if (msg == null) throw new Exception("Message not found.");

            msg.IsResolved = true;
            DbContext.SaveChanges();

            if (!string.IsNullOrWhiteSpace(replyMessage) && msg.UserId.HasValue)
            {
                var notifOps = new NotificationDataOps(DbContext);

                notifOps.Create(msg.UserId.Value, "SupportReply", new
                {
                    date = msg.CreatedAt.ToString("dd MMM yyyy"),
                    issueType = msg.IssueType ?? "",
                    reply = replyMessage
                });
            }
        }
        public void Delete(int id)
        {
            var msg = DbContext.SupportMessages.Find(id);
            if (msg == null) throw new Exception("Mesajul nu a fost gasit");

            DbContext.SupportMessages.Remove(msg);
            DbContext.SaveChanges();
        }
    }
}