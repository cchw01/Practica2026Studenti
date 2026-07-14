using Backend.Migrations;
using Backend.Models;

namespace Backend.DataManagement
{
    public class ForumCommentDataOps
    {
        private readonly ApplicationDbContext DbContext;

        public ForumCommentDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }
        public ForumComment[]? GetForumComments()
        {
            return DbContext?.ForumComments.ToArray();
        }

        public ForumComment[]? GetCommentsByPostId(int postId)
        {
            return DbContext?.ForumComments.Where(c => c.ForumPostId == postId).ToArray();
        }

        public ForumComment? GetForumCommentById(int id)
        {
            return DbContext?.ForumComments.Where(x => x.Id == id).FirstOrDefault();
        }

        public void AddForumComment(ForumComment forumComment)
        {
            DbContext?.ForumComments.Add(forumComment);
            DbContext?.SaveChanges();
        }
        public void UpdateForumComment(ForumComment forumComment)
        {
            DbContext?.ForumComments.Update(forumComment);
            DbContext?.SaveChanges();
        }
        public void DeleteForumComment(int id)
        {
            var forumComment = DbContext?.ForumComments.Where(x => x.Id == id).FirstOrDefault();
            if (forumComment != null)
            {
                DbContext?.ForumComments.Remove(forumComment);
                DbContext?.SaveChanges();
            }
        }

    }
}
