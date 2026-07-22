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
        private readonly IWebHostEnvironment _environment;

        public ProfilePictureController(ApplicationDbContext dbContext, IWebHostEnvironment environment)
        {
            this.dbContext = dbContext;
            dataOps = new ProfilePictureDataOps(dbContext);
            userDataOps = new UserDataOps(dbContext);
            _environment = environment;
        }

        [Authorize]
        [HttpPost("upload")]
       public async Task<ActionResult<ProfilePicture>> UploadProfilePicture([FromForm] ProfilePictureDto profilePicture)
        {

            if (profilePicture == null)
                return BadRequest("No files have been selected.");
            int userId = int.Parse(User.FindFirstValue("id")!);
            var user = userDataOps.GetUserById(userId);
            if (user == null)
            {
                return Unauthorized("The user doesn't exist.");
            }
            var AllowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            var picture = profilePicture.Picture;
            var extension = Path.GetExtension(picture.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest("The file extension is not allowed.");
            }
            string webRoot = _environment.WebRootPath
                 ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            string uploadsFolder = Path.Combine(webRoot, "Assets", "ProfilePictures");
            if (user.ProfilePictureId != null)
            {
                var oldPicture = dataOps.GetProfilePictureById(user.ProfilePictureId.Value);
                if (oldPicture != null)
                {
                    string oldFilePath = Path.Combine(uploadsFolder, oldPicture.Name);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath); 
                    }
                    dataOps.DeletePicture(oldPicture.Id); 
                }
            }
 
            string name = $"{timestamp}{extension}";
            string fullPath = Path.Combine(uploadsFolder, name);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await picture.CopyToAsync(stream);
            }            
            var newPicture = new ProfilePicture { Name = name };
            dataOps.AddPicture(newPicture);
            user.ProfilePictureId = newPicture.Id;
            userDataOps.UpdateUser(user);
            return Ok(newPicture.Name);
        }
    }
}
