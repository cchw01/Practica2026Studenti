using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileDataOps _dataOps;

        public ProfileController(ApplicationDbContext dbContext)
        {
            _dataOps = new ProfileDataOps(dbContext);
        }

        [HttpGet]
        public ActionResult<IEnumerable<ProfileDto>> GetAllProfiles()
        {
            try
            {
                var profiles = _dataOps.GetAllProfiles();
                return Ok(profiles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public ActionResult<ProfileDto> GetProfileById(string id)
        {
            try
            {
                var profile = _dataOps.GetProfileById(id);
                if (profile is null)
                    return NotFound(new { message = $"Utilizatorul cu id='{id}' nu a fost găsit." });

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("username/{userName}")]
        public ActionResult<ProfileDto> GetProfileByUserName(string userName)
        {
            try
            {
                var profile = _dataOps.GetProfileByUserName(userName);
                if (profile is null)
                    return NotFound(new { message = $"Utilizatorul cu userName='{userName}' nu a fost găsit." });

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<ProfileDto> UpdateProfile(string id, [FromBody] UpdateProfileRequest request)
        {
            try
            {
                if (request is null)
                    return BadRequest(new { message = "Corpul cererii este null." });

                var updated = _dataOps.UpdateProfile(id, request);
                if (updated is null)
                    return NotFound(new { message = $"Utilizatorul cu id='{id}' nu a fost găsit." });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("{id}/reviews")]
        public ActionResult<IEnumerable<ReviewDto>> GetReviewsForUser(string id)
        {
            try
            {
                var reviews = _dataOps.GetReviewsForUser(id);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("{id}/reviews/given")]
        public ActionResult<IEnumerable<ReviewDto>> GetReviewsByUser(string id)
        {
            try
            {
                var reviews = _dataOps.GetReviewsByUser(id);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpPost("{id}/reviews")]
        public ActionResult<ReviewDto> AddReview(string id, [FromBody] AddReviewRequest request)
        {
            try
            {
                if (request is null)
                    return BadRequest(new { message = "Corpul cererii este null." });

                if (request.Score < 0 || request.Score > 5)
                    return BadRequest(new { message = "Score-ul trebuie să fie între 0 și 5." });

                if (string.IsNullOrWhiteSpace(request.ReviewerId))
                    return BadRequest(new { message = "ReviewerId este obligatoriu." });

                if (!int.TryParse(id, out var reviewedUserId))
                    return BadRequest(new { message = "Id-ul utilizatorului nu este valid." });

                if (!int.TryParse(request.ReviewerId, out var reviewerId))
                    return BadRequest(new { message = "ReviewerId nu este valid." });

                var review = new Review
                {
                    ReviewerId = reviewerId,
                    ReviewedUserId = reviewedUserId,
                    Rating = request.Score,
                    Comment = request.Comment ?? string.Empty
                };

                var dto = _dataOps.AddReview(review);
                return CreatedAtAction(nameof(GetReviewsForUser), new { id }, dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpDelete("{id}/reviews/{reviewId}")]
        public ActionResult DeleteReview(string id, string reviewId)
        {
            try
            {
                var deleted = _dataOps.DeleteReview(reviewId);
                if (!deleted)
                    return NotFound(new { message = $"Review-ul cu id='{reviewId}' nu a fost găsit." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("{id}/items")]
        public ActionResult<IEnumerable<AuctionItemDto>> GetAddedItems(string id)
        {
            try
            {
                var items = _dataOps.GetAddedItemsByUser(id);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("{id}/items/won")]
        public ActionResult<IEnumerable<AuctionItemDto>> GetWonItems(string id)
        {
            try
            {
                var items = _dataOps.GetWonItemsByUser(id);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }
    }

    public class AddReviewRequest
    {
        public string ReviewerId { get; set; } = string.Empty;
        public float Score { get; set; }
        public string? Comment { get; set; }
    }
}
