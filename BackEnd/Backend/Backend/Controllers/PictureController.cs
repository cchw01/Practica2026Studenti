using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PictureController : ControllerBase
    {
        private readonly ApplicationDbContext DbContext;
        private readonly PictureDataOps dataOps;
        private readonly PictureService pictureService;

        public PictureController(ApplicationDbContext dbContext, PictureDataOps dataOps, PictureService pictureService)
        {
            DbContext = dbContext;
            this.dataOps = dataOps;
            this.pictureService = pictureService;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> AddPicture([FromForm] List<AddPictureDto> pictureDtos)
        {
            if (pictureDtos == null)
                return BadRequest("No files have been selected.");

            var AllowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var savedPictures = new List<Picture>();
            string timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");

            foreach (var dto in pictureDtos)
            {
                IFormFile picture = dto.Picture;
                var extension = Path.GetExtension(picture.FileName).ToLowerInvariant();

                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest("The file extension is not allowed.");
                }

                string name = $"{dto.Name}_{timestamp}{extension}";
                pictureService.SavePicture(picture, name);

                var newPicture = new Picture { Name = name };
                dataOps.AddPicture(newPicture);
                savedPictures.Add(newPicture);
            }
            return Ok(savedPictures);
        }

        [HttpPost("delete-picture")]
        public ActionResult<Picture> DeletePicture([FromBody] List<int> pictureIds)
        {
            if (pictureIds == null)
            {
                return BadRequest("No picture IDs were provided.");
            }

            foreach (var id in pictureIds)
            {
                var picture = dataOps.GetPictureById(id);
                if (picture == null)
                {
                    return NotFound($"Could not find picture with ID {id}.");
                }
                if (!pictureService.DeletePicture(picture.Name))
                {
                    return BadRequest($"Could not delete picture with ID {id}.");
                }
                dataOps.DeletePicture(id);
            }
            return Ok(new { Message = "All selected images were successfully deleted.", DeletedIds = pictureIds });
        }
    }
}