using Microsoft.AspNetCore.Mvc;

namespace Backend.DataManagement
{
    public class ReviewDataOps
    {
        private readonly YourAppDbContext dbContext;

        public ReviewDataOps(YourAppDbContext context)
        {
            dbContext = context;
        }

        public Review[] GetReviews()
        {
            return dbContext.Reviews.ToArray();
        }

        public Review? GetReviewById(int id)
        {
            var review = dbContext.Reviews.Where(x => x.Id == id).FirstOrDefault();
            return review;
        }

        public void AddReview(Review review)
        {
            dbContext.Reviews.Add(review);
            dbContext.SaveChanges();
        }

        public void UpdateReview(Review review)
        {
            dbContext?.Reviews.Update(review);
            dbContext?.SaveChanges();
        }

        public void DeleteReview(int id)
        {
            var review = dbContext.Reviews.Where(x => x.Id == id).FirstOrDefault();
            if (review != null)
            {
                dbContext.Reviews.Remove(review);
                dbContext.SaveChanges();
            }
        }
    }
}