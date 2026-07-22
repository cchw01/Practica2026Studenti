using Backend.DataManagement;
using Backend.DTOs;
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
                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID-ul trebuie să fie un număr întreg." });

                var profile = _dataOps.GetProfileById(userId);
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
        public ActionResult<ProfileDto> UpdateProfile(string id, [FromBody] UpdateProfileDto request)
        {
            try
            {
                if (request is null)
                    return BadRequest(new { message = "Corpul cererii este null." });

                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID-ul trebuie să fie un număr întreg." });

                var updated = _dataOps.UpdateProfile(userId, request);
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
                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID-ul trebuie să fie un număr întreg." });

                var reviews = _dataOps.GetReviewsForUser(userId);
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
                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID-ul trebuie să fie un număr întreg." });

                var reviews = _dataOps.GetReviewsByUser(userId);
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

                if (!int.TryParse(id, out int reviewedUserId))
                    return BadRequest(new { message = "ReviewedUserId (id) trebuie să fie un număr întreg." });

                if (!int.TryParse(request.ReviewerId, out int reviewerId))
                    return BadRequest(new { message = "ReviewerId trebuie să fie un număr întreg." });

                var review = new Review
                {
                    ReviewerId = reviewerId,
                    ReviewedUserId = reviewedUserId,
                    Rating = request.Score,
                    Comment = request.Comment ?? string.Empty,
                    ReviewDate = DateTime.UtcNow
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
                if (!int.TryParse(reviewId, out int rid))
                    return BadRequest(new { message = "ReviewId trebuie să fie un număr întreg." });

                var deleted = _dataOps.DeleteReview(rid);
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
        public ActionResult<IEnumerable<AuctionItemSummaryDto>> GetAddedItems(string id)
        {
            try
            {
                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID-ul trebuie să fie un număr întreg." });

                var items = _dataOps.GetAddedItemsByUser(userId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpGet("{id}/items/won")]
        public ActionResult<IEnumerable<AuctionItemSummaryDto>> GetWonItems(string id)
        {
            try
            {
                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID-ul trebuie să fie un număr întreg." });

                var items = _dataOps.GetWonItemsByUser(userId);
                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare internă.", detail = ex.Message });
            }
        }

        [HttpPost("{id}/change-password")]
        public ActionResult ChangePassword(string id, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (request is null)
                    return BadRequest(new { message = "Request body is null." });

                if (!int.TryParse(id, out int userId))
                    return BadRequest(new { message = "ID must be an integer." });

                var user = _dataOps.GetRawUserById(userId);
                if (user is null)
                    return NotFound(new { message = $"User with ID '{id}' was not found." });

                if (string.IsNullOrEmpty(user.Password) ||
                    !Backend.Services.PasswordHasher.VerifyPassword(request.CurrentPassword, user.Password))
                    return BadRequest(new { message = "Current password is incorrect." });

                user.Password = Backend.Services.PasswordHasher.HashPassword(request.NewPassword);
                _dataOps.SaveChanges();

                return Ok(new { message = "Password updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal error.", detail = ex.Message });
            }
        }
    }

    public class AddReviewRequest
    {
        public string ReviewerId { get; set; } = string.Empty;
        public float Score { get; set; }
        public string? Comment { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
