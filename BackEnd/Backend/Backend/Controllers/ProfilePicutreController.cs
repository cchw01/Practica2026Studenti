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
       public ActionResult<ProfilePicture> UploadProfilePicture(IFormFile profilePicture)
        {

            if (profilePicture == null)
                return BadRequest("No files have been selected.");
            int userId = int.Parse(User.FindFirstValue("id")!);
            var user = userDataOps.GetUserById(userId);
            if (user == null)
            {
                return Unauthorized("The user doesn't exist.");
            }
            if(user.ProfilePictureId!= null)
            {         
                dataOps.DeletePicture(user.ProfilePictureId.Value);
            }
            var AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(profilePicture.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest("The file extension is not allowed.");
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
    }
}
