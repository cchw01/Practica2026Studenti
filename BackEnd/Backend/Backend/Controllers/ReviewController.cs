using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

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
        public ActionResult<IEnumerable<ReviewDTO>> GetReviews()
        {
            try
            {
                var reviews = dataOps.GetReviews();
                var dtos = reviews.Select(MapToDTO);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<ReviewDTO> GetReview(int id)
        {
            try
            {
                var review = dataOps.GetReviewById(id);

                if (review == null)
                    return NotFound();

                return Ok(MapToDTO(review));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult<ReviewDTO> AddReview(ReviewCreateDTO dto)
        {
            try
            {
                if (dto.Rating < 0 || dto.Rating > 5)
                    return BadRequest("Ratings need to be between 0 and 5.");

                var review = new Review
                {
                    ReviewerId = dto.ReviewerId,
                    ReviewedUserId = dto.ReviewedUserId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    ReviewDate = DateTime.UtcNow
                };

                dataOps.AddReview(review);

                var created = dataOps.GetReviewById(review.Id);
                return Ok(MapToDTO(created!));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public ActionResult<ReviewDTO> UpdateReview(int id, ReviewCreateDTO dto)
        {
            try
            {
                if (dto.Rating < 0 || dto.Rating > 5)
                    return BadRequest("Ratings need to be between 0 and 5.");

                var existing = dataOps.GetReviewById(id);
                if (existing == null)
                    return NotFound();

                existing.ReviewerId = dto.ReviewerId;
                existing.ReviewedUserId = dto.ReviewedUserId;
                existing.Rating = dto.Rating;
                existing.Comment = dto.Comment;

                dataOps.UpdateReview(existing);

                var updated = dataOps.GetReviewById(id);
                return Ok(MapToDTO(updated!));
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

        private static ReviewDTO MapToDTO(Review review)
        {
            return new ReviewDTO
            {
                Id = review.Id,
                ReviewerId = review.ReviewerId,
                ReviewerUserName = review.Reviewer?.UserName ?? "",
                ReviewedUserId = review.ReviewedUserId,
                ReviewedUserUserName = review.ReviewedUser?.UserName ?? "",
                Rating = review.Rating,
                Comment = review.Comment,
                ReviewDate = review.ReviewDate
            };
        }
    }
}