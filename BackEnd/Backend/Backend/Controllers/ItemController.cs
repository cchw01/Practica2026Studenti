using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionItemController : ControllerBase
    {
        private readonly AuctionItemDataOps dataOps;
        private readonly CategoryDataOps categoryDataOps;
        private readonly UserDataOps userDataOps;
        private readonly IWebHostEnvironment env;

        public AuctionItemController(
            ApplicationDbContext dbContext,
            IWebHostEnvironment env)
        {
            dataOps = new AuctionItemDataOps(dbContext);
            categoryDataOps = new CategoryDataOps(dbContext);
            userDataOps = new UserDataOps(dbContext);
            this.env = env;
        }

        [HttpGet]
        public ActionResult<AuctionItemResponseDto[]> GetAuctionItems()
        {
            try
            {
                var items = dataOps.GetAuctionItems();

                var response = items
                    .Select(MapToResponseDto)
                    .ToArray();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<AuctionItemResponseDto> GetAuctionItemById(int id)
        {
            try
            {
                var auctionItem = dataOps.GetAuctionItemById(id);

                if (auctionItem == null)
                    return NotFound();

                return Ok(MapToResponseDto(auctionItem));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        public ActionResult<AuctionItemResponseDto> AddAuctionItem(
            CreateAuctionItemDto dto)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null)
                    return Unauthorized();

                var owner = userDataOps.GetUserById(
                    authenticatedUserId.Value);

                if (owner == null)
                {
                    return Unauthorized(
                        "Utilizatorul autentificat nu există.");
                }

                var category = categoryDataOps.GetCategoryById(
                    dto.CategoryId);

                if (category == null)
                {
                    return BadRequest(
                        "Categoria specificată nu există.");
                }

                var item = new AuctionItem
                {
                    Name = dto.Name,
                    StartPrice = dto.StartPrice,
                    CurrentPrice = dto.StartPrice,
                    CategoryId = dto.CategoryId,
                    Description = dto.Description,
                    Location = dto.Location,
                    OwnerId = authenticatedUserId.Value,
                    WinnerId = null,
                    Status = AuctionItem.StatusEnum.Added,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate
                };

                dataOps.AddAuctionItem(item);

                var createdItem = dataOps.GetAuctionItemById(item.ID);

                if (createdItem == null)
                {
                    return BadRequest(
                        "Itemul a fost salvat, dar nu a putut fi citit.");
                }

                var response = MapToResponseDto(createdItem);

                return CreatedAtAction(
                    nameof(GetAuctionItemById),
                    new { id = response.ID },
                    response);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message
                    ?? ex.Message;

                return BadRequest(errorMessage);
            }
        }

        [Authorize]
        [HttpPost("with-image")]
        public async Task<ActionResult<AuctionItemResponseDto>>
            AddAuctionItemWithImage(
                [FromForm] AuctionItemWithImageRequest request)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null)
                    return Unauthorized();

                var owner = userDataOps.GetUserById(
                    authenticatedUserId.Value);

                if (owner == null)
                {
                    return Unauthorized(
                        "Utilizatorul autentificat nu există.");
                }

                var category = categoryDataOps.GetCategoryById(
                    request.CategoryId);

                if (category == null)
                {
                    return BadRequest(
                        "Categoria specificată nu există.");
                }

                if (request.StartPrice <= 0)
                {
                    return BadRequest(
                        "Prețul de pornire trebuie să fie mai mare decât 0.");
                }

                if (request.DurationDays <= 0)
                {
                    return BadRequest(
                        "Durata licitației trebuie să fie mai mare decât 0.");
                }

                string? imageUrl = null;

                if (request.Image != null &&
                    request.Image.Length > 0)
                {
                    var webRootPath = env.WebRootPath
                        ?? Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "wwwroot");

                    var uploadsFolder = Path.Combine(
                        webRootPath,
                        "images");

                    Directory.CreateDirectory(uploadsFolder);

                    var extension = Path.GetExtension(
                        request.Image.FileName);

                    var uniqueFileName =
                        $"{Guid.NewGuid()}{extension}";

                    var filePath = Path.Combine(
                        uploadsFolder,
                        uniqueFileName);

                    await using var fileStream = new FileStream(
                        filePath,
                        FileMode.Create);

                    await request.Image.CopyToAsync(fileStream);

                    imageUrl = $"/images/{uniqueFileName}";
                }

                var startDate = DateTime.UtcNow;

                var item = new AuctionItem
                {
                    Name = request.Name,
                    StartPrice = request.StartPrice,
                    CurrentPrice = request.StartPrice,
                    CategoryId = request.CategoryId,
                    Description = request.Description,
                    Location = request.Location,
                    OwnerId = authenticatedUserId.Value,
                    WinnerId = null,
                    Status = AuctionItem.StatusEnum.Added,
                    StartDate = startDate,
                    EndDate = startDate.AddDays(
                        request.DurationDays),
                    ImageUrl = imageUrl
                };

                dataOps.AddAuctionItem(item);

                var createdItem = dataOps.GetAuctionItemById(item.ID);

                if (createdItem == null)
                {
                    return BadRequest(
                        "Itemul a fost salvat, dar nu a putut fi citit.");
                }

                var response = MapToResponseDto(createdItem);

                return CreatedAtAction(
                    nameof(GetAuctionItemById),
                    new { id = response.ID },
                    response);
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message
                    ?? ex.Message;

                return BadRequest(errorMessage);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public ActionResult<AuctionItemResponseDto> UpdateAuctionItem(
            int id,
            UpdateAuctionItemDto dto)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null)
                    return Unauthorized();

                var item = dataOps.GetTrackedAuctionItemById(id);

                if (item == null)
                    return NotFound();

                var isOwner =
                    item.OwnerId == authenticatedUserId.Value;

                var isAdmin = User.IsInRole("Admin");

                if (!isOwner && !isAdmin)
                    return Forbid();

                var category = categoryDataOps.GetCategoryById(
                    dto.CategoryId);

                if (category == null)
                {
                    return BadRequest(
                        "Categoria specificată nu există.");
                }

                item.Name = dto.Name;
                item.StartPrice = dto.StartPrice;
                item.CategoryId = dto.CategoryId;
                item.Description = dto.Description;
                item.Location = dto.Location;
                item.StartDate = dto.StartDate;
                item.EndDate = dto.EndDate;

                dataOps.SaveChanges();

                var updatedItem = dataOps.GetAuctionItemById(id);

                if (updatedItem == null)
                    return NotFound();

                return Ok(MapToResponseDto(updatedItem));
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message
                    ?? ex.Message;

                return BadRequest(errorMessage);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public ActionResult DeleteAuctionItem(int id)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null)
                    return Unauthorized();

                var item = dataOps.GetTrackedAuctionItemById(id);

                if (item == null)
                    return NotFound();

                var isOwner =
                    item.OwnerId == authenticatedUserId.Value;

                var isAdmin = User.IsInRole("Admin");

                if (!isOwner && !isAdmin)
                    return Forbid();

                var deleted = dataOps.DeleteAuctionItem(id);

                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message
                    ?? ex.Message;

                return BadRequest(errorMessage);
            }
        }

        private static AuctionItemResponseDto MapToResponseDto(
            AuctionItem item)
        {
            return new AuctionItemResponseDto
            {
                ID = item.ID,
                Name = item.Name,
                StartPrice = item.StartPrice,
                CurrentPrice = item.CurrentPrice,
                CategoryId = item.CategoryId,
                CategoryName = item.Category?.name
                    ?? string.Empty,
                Description = item.Description,
                Location = item.Location,
                OwnerId = item.OwnerId,
                OwnerUserName = item.Owner?.UserName
                    ?? string.Empty,
                WinnerId = item.WinnerId,
                WinnerUserName = item.Winner?.UserName,
                Status = item.Status,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                ImageUrl = item.ImageUrl
            };
        }

        private int? GetAuthenticatedUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value
                ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
                return userId;

            return null;
        }
    }
}