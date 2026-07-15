using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            return DbContext.Reviews.ToArray();
        }

        public Review? GetReviewById(int id)
        {
            var review = DbContext.Reviews.Where(x => x.Id == id).FirstOrDefault();
            return review;
        }

        public Review[] GetReviewsByUserId(int userId)
        {
            return DbContext.Reviews
                .Where(r => r.ReviewedUserId == userId)
                .Include(r => r.Reviewer)   
                .OrderByDescending(r => r.ReviewDate)
                .ToArray();
        }
        public void AddReview(Review review)
        {
            DbContext.Reviews.Add(review);
            DbContext.SaveChanges();
        }

        public void UpdateReview(Review review)
        {
            DbContext?.Reviews.Update(review);
            DbContext?.SaveChanges();
        }

        public void DeleteReview(int id)
        {
            var review = DbContext.Reviews.Where(x => x.Id == id).FirstOrDefault();
            if (review != null)
            {
                DbContext.Reviews.Remove(review);
                DbContext.SaveChanges();
            }
        }
    }
}