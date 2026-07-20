using System;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
namespace Backend.DataManagement
{
    public class ForumPostDataOps
    {

        private readonly ApplicationDbContext DbContext;

        public ForumPostDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }

        public ForumPost[]? GetForumPosts()
        {
            return DbContext?.ForumPosts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .ToArray();
        }

        public ForumPost? GetForumPostById(int id)
        {
            return DbContext?.ForumPosts
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Where(x => x.Id == id)
                .FirstOrDefault();
        }

        public void AddForumPost(ForumPost forumPost)
        {
            DbContext?.ForumPosts.Add(forumPost);
            DbContext?.SaveChanges();
        }

        public void DeleteForumPost(int id)
        {
            var forumPost = DbContext?.ForumPosts.Where(x => x.Id == id).FirstOrDefault();
            if (forumPost != null)
            {
                DbContext?.ForumPosts.Remove(forumPost);
                DbContext?.SaveChanges();
            }
        }

        public void UpdateForumPost(ForumPost forumPost)
        {
            DbContext?.ForumPosts.Update(forumPost);
            DbContext?.SaveChanges();
        }

    }
}
