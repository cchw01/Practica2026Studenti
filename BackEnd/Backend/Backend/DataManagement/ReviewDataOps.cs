using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

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