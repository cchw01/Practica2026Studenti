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
        PictureController(ApplicationDbContext dbContext, PictureDataOps dataOps, PictureService pictureService)
        {
            DbContext = dbContext;
            this.dataOps = dataOps;
            this.pictureService = pictureService;
        }

        [HttpPost("upload")]
        public ActionResult<Picture> AddPicture(List<AddPictureDto> pictureDtos)
        {
            if (pictureDtos == null)
                return BadRequest("Nu a fost selectat niciun fișier.");
            var AllowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            foreach (var dto in pictureDtos)
            {
                string name = dto.Name + DateTime.Now.ToString("yyyyMMddHHmmssfff");
                IFormFile picture = dto.Picture;
                var extension = Path.GetExtension(picture.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest("Extensia nu este acceptata.");
                }
                pictureService.SavePicture(picture, name);
                dataOps.AddPicture(new Picture { Name = name });
            }
            return Ok();
        }
        [HttpPost("delete-picture")]
        public ActionResult<Picture> DeletePicture(List<int> pictureIds)
        {
            if(pictureIds == null)
            {
                return BadRequest("Nu a fost selectat niciun fișier.");
            }
            foreach(var id in pictureIds)
            {
                var picture = dataOps.GetPictureById(id);
                if (picture == null)
                {
                    return NotFound($"Nu s-a găsit fișierul cu ID-ul {id}.");
                }
                if(!pictureService.DeletePicture(picture.Name))
                {
                    return BadRequest($"Nu s-a putut șterge fișierul cu ID-ul {id}.");
                }
                dataOps.DeletePicture(id);
            }
            return Ok();
        }
    }
}
