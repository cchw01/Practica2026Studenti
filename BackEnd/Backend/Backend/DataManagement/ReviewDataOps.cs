using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.DataManagement
{
    public class ReviewDataOps
    {
        private readonly ApplicationDbContext DbContext;

        public ReviewDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }

        public Review[] GetReviews()
        {
            return DbContext.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.ReviewedUser)
                .ToArray();
        }

        public Review? GetReviewById(int id)
        {
            return DbContext.Reviews
                .Include(r => r.Reviewer)
                .Include(r => r.ReviewedUser)
                .FirstOrDefault(x => x.Id == id);
        }

        public void AddReview(Review review)
        {
            DbContext.Reviews.Add(review);
            DbContext.SaveChanges();
        }

        public void UpdateReview(Review review)
        {
            DbContext.Reviews.Update(review);
            DbContext.SaveChanges();
        }

        public void DeleteReview(int id)
        {
            var review = DbContext.Reviews.FirstOrDefault(x => x.Id == id);
            if (review != null)
            {
                DbContext.Reviews.Remove(review);
                DbContext.SaveChanges();
            }
        }
    }
}