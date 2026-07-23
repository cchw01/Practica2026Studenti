using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfilePictureController : ControllerBase
    {
        private readonly DbContext dbContext;
        private readonly UserDataOps userDataOps;
        private readonly ProfilePictureDataOps dataOps;

        public ProfilePictureController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
            dataOps = new ProfilePictureDataOps(dbContext);
            userDataOps = new UserDataOps(dbContext);
        }

        [Authorize]
        [HttpPost("upload")]
        public ActionResult<string> UploadProfilePicture(IFormFile profilePicture)
        {
            try
            {
                if (profilePicture == null || profilePicture.Length == 0)
                    return BadRequest("No files have been selected.");

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var extension = Path.GetExtension(profilePicture.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest("The file extension is not allowed.");

                const long maxSizeBytes = 5 * 1024 * 1024; 
                if (profilePicture.Length > maxSizeBytes)
                    return BadRequest("The file is too large (max 5MB).");

                var userIdClaim = User.FindFirstValue("id");
                if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                    return Unauthorized("Invalid or missing user token.");

                var user = userDataOps.GetUserById(userId);
                if (user == null)
                    return Unauthorized("The user doesn't exist.");

                if (user.ProfilePictureId != null)
                {
                    dataOps.DeletePicture(user.ProfilePictureId.Value);
                }

                using var ms = new MemoryStream();
                profilePicture.CopyTo(ms);
                var base64 = Convert.ToBase64String(ms.ToArray());

                var newPicture = new ProfilePicture { PictureBase64 = base64 };
                dataOps.AddPicture(newPicture);
                user.ProfilePictureId = newPicture.Id;
                userDataOps.UpdateUser(user);

                return Ok(newPicture.PictureBase64);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("{userId}")]
        public ActionResult<string> GetProfilePicture(int userId)
        {
            try
            {
                var user = userDataOps.GetUserById(userId);
                if (user == null)
                    return NotFound("The user doesn't exist.");

                if (user.ProfilePictureId == null)
                    return NotFound("The user has no profile picture.");

                var picture = dataOps.GetProfilePictureById(user.ProfilePictureId.Value);
                if (picture == null)
                    return NotFound("Profile picture not found.");

                return Ok(picture.PictureBase64);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}