using Backend.Models;
using Microsoft.EntityFrameworkCore;
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
            return DbContext?.ForumComments.Include(c => c.User).ToArray();
        }

        public ForumComment[]? GetCommentsByPostId(int postId)
        {
            return DbContext?.ForumComments.Include(c => c.User).Where(c => c.ForumPostId == postId).ToArray();
        }

        public bool DoesPostExist(int postId)
        {
            return DbContext?.ForumPosts.Any(p => p.Id == postId) ?? false;
        }

        public ForumComment? GetForumCommentById(int id)
        {
            return DbContext?.ForumComments.Include(c => c.User).Where(x => x.Id == id).FirstOrDefault();
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
