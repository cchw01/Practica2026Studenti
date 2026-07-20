using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuctionItemController : ControllerBase
    {
        private readonly AuctionItemDataOps dataOps;
        private readonly IWebHostEnvironment env;

        public AuctionItemController(ApplicationDbContext dbContext, IWebHostEnvironment env)
        {
            dataOps = new AuctionItemDataOps(dbContext);
            this.env = env;
        }

        [HttpGet]
        public ActionResult<IEnumerable<AuctionItem>> GetAuctionItems()
        {
            try
            {
                var items = dataOps.GetAuctionItems();
                return Ok(items);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        public ActionResult<AuctionItem> AddAuctionItem(AuctionItem item)
        {
            try
            {
                dataOps.AddAuctionItem(item);
                return Ok(item);
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(errorMessage);
            }
        }

        [HttpPost("with-image")]
        public async Task<ActionResult<AuctionItem>> AddAuctionItemWithImage([FromForm] AuctionItemWithImageRequest request)
        {
            try
            {
                string? imageUrl = null;
                if (request.Image != null && request.Image.Length > 0)
                {
                    var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images");
                    Directory.CreateDirectory(uploadsFolder);
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Image.FileName;
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.Image.CopyToAsync(fileStream);
                    }
                    imageUrl = "/images/" + uniqueFileName;
                }

                var item = new AuctionItem
                {
                    Name = request.Name,
                    StartPrice = request.StartPrice,
                    CurrentPrice = request.StartPrice,
                    CategoryId = request.CategoryId,
                    Description = request.Description,
                    Location = request.Location,
                    OwnerId = request.OwnerId,
                    Status = AuctionItem.StatusEnum.Added,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(request.DurationDays),
                    ImageUrl = imageUrl
                };

                dataOps.AddAuctionItem(item);
                return Ok(item);
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(errorMessage);
            }
        }

        [HttpPut]
        public ActionResult<AuctionItem> UpdateAuctionItem(AuctionItem item)
        {
            try
            {
                dataOps.UpdateAuctionItem(item);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<AuctionItem> GetAuctionItemById(int id)
        {
            try
            {
                var auctionItem = dataOps.GetAuctionItemById(id);
                return Ok(auctionItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteAuctionItem(int id)
        {
            try
            {
                dataOps.DeleteAuctionItem(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}