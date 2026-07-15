using Backend.DataManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly ReviewDataOps dataOps;

        public ReviewController(ApplicationDbContext DbContext)
        {
            dataOps = new ReviewDataOps(DbContext);
        }

        [HttpGet]
        public ActionResult<Review> GetReviews()
        {
            try
            {
                var reviews = dataOps.GetReviews();
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Review> GetReview(int id)
        {
            try
            {
                var review = dataOps.GetReviewById(id);

                if (review == null)
                    return NotFound();

                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("user/{userId}")]
        public ActionResult<Review[]> GetReviewsForUser(int userId)
        {
            return Ok(dataOps.GetReviewsByUserId(userId));
        }

        [HttpPost]
        public ActionResult<Review> AddReview(Review review)
        {
            try
            {
                if (review.Rating < 0 || review.Rating > 5)
                    return BadRequest("Ratings need to be between 0 and 5.");

                dataOps.AddReview(review);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public ActionResult<Review> UpdateReview(Review review)
        {
            try
            {
                if (review.Rating < 0 || review.Rating > 5)
                    return BadRequest("Ratings need to be between 0 and 5.");

                dataOps.UpdateReview(review);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteReview(int id)
        {
            try
            {
                dataOps.DeleteReview(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}