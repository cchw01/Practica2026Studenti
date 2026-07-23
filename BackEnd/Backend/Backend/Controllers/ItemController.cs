using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionItemController : ControllerBase
    {
        private readonly AuctionItemDataOps dataOps;
        private readonly CategoryDataOps categoryDataOps;
        private readonly UserDataOps userDataOps;
        private readonly BidDataOps bidDataOps;
        private readonly IWebHostEnvironment env;

        public AuctionItemController(
            ApplicationDbContext dbContext,
            IWebHostEnvironment env)
        {
            dataOps = new AuctionItemDataOps(dbContext);
            categoryDataOps = new CategoryDataOps(dbContext);
            userDataOps = new UserDataOps(dbContext);
            bidDataOps = new BidDataOps(dbContext);
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

        [HttpGet("active")]
        public ActionResult<AuctionItemResponseDto[]> GetActiveAuctionItems()
        {
            try
            {
                var items = dataOps.GetActiveAuctionItems();

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
                        "User does not exist");
                }

                var category = categoryDataOps.GetCategoryById(
                    dto.CategoryId);

                if (category == null)
                {
                    return BadRequest(
                        "Category not found");
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
                        "ERROR");
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
                        "error");
                }

                var category = categoryDataOps.GetCategoryById(
                    request.CategoryId);

                if (category == null)
                {
                    return BadRequest(
                        "error");
                }

                if (request.StartPrice <= 0)
                {
                    return BadRequest(
                        "Price must be higher than 0");
                }

                if (request.DurationDays <= 0)
                {
                    return BadRequest(
                        "Duration must be higher than 0");
                }

                var imageList = new List<string>();
                var filesToProcess = new List<IFormFile>();

                if (request.Images != null && request.Images.Count > 0)
                {
                    filesToProcess.AddRange(request.Images);
                }
                else if (request.Image != null && request.Image.Length > 0)
                {
                    filesToProcess.Add(request.Image);
                }

                foreach (var file in filesToProcess)
                {
                    if (file.Length > 0)
                    {
                        using var memoryStream = new MemoryStream();
                        await file.CopyToAsync(memoryStream);
                        var imageBytes = memoryStream.ToArray();
                        var contentType = string.IsNullOrEmpty(file.ContentType) ? "image/jpeg" : file.ContentType;
                        imageList.Add($"data:{contentType};base64,{Convert.ToBase64String(imageBytes)}");
                    }
                }

                string? imageUrl = imageList.Count > 0 ? string.Join("|||", imageList) : null;

                var startDate = DateTime.Now;

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
                        "error");
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
                        "Category not found");
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
        [HttpPost("{id}/close")]
        public ActionResult<AuctionItemResponseDto> CloseAuctionItem(int id)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null)
                    return Unauthorized();

                var item = dataOps.GetTrackedAuctionItemById(id);

                if (item == null)
                    return NotFound("Auction not found.");

                var isOwner = item.OwnerId == authenticatedUserId.Value;
                var isAdmin = User.IsInRole("Admin");

                if (!isOwner && !isAdmin)
                    return Forbid();

                if (
                    item.Status == AuctionItem.StatusEnum.Sold ||
                    item.Status == AuctionItem.StatusEnum.Expired
                )
                {
                    return BadRequest("The auction has already been closed.");
                }

                if (item.EndDate > DateTime.Now && !isAdmin)
                {
                    return BadRequest(
                        "The auction cannot be closed before its end date."
                    );
                }

                var winningBid = bidDataOps.GetHighestBidByItemId(item.ID);

                if (winningBid != null)
                {
                    item.WinnerId = winningBid.BidderId;
                    item.CurrentPrice = winningBid.Price;
                    item.Status = AuctionItem.StatusEnum.Sold;
                }
                else
                {
                    item.WinnerId = null;
                    item.CurrentPrice = item.StartPrice;
                    item.Status = AuctionItem.StatusEnum.Expired;
                }

                dataOps.SaveChanges();

                var closedItem = dataOps.GetAuctionItemById(id);

                if (closedItem == null)
                    return NotFound();

                return Ok(MapToResponseDto(closedItem));
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

        public AuctionItem? ProcessAuctionEnd(int auctionId, BidDataOps bidDataOps)
        {
            var item = dataOps.GetTrackedAuctionItemById(auctionId);
            if (item == null) return null;

            if (item.Status == AuctionItem.StatusEnum.Sold ||
                item.Status == AuctionItem.StatusEnum.NoWinner ||
                item.Status == AuctionItem.StatusEnum.Rejected)
            {
                return item; 
            }
            item.EndDate = DateTime.Now;
            var bids = bidDataOps.GetBidsByItemId(auctionId);
            if (bids != null && bids.Length > 0)
            {
                var highestBid = bids.OrderByDescending(b => b.Price).First();
                item.Status = AuctionItem.StatusEnum.Sold;
                item.WinnerId = highestBid.BidderId;
            }
            else
            {
                item.Status = AuctionItem.StatusEnum.NoWinner;
            }
            dataOps.SaveChanges();
            return item;
        }

        [Authorize]
        [HttpPost("{id}/end")]
        public ActionResult<AuctionItemResponseDto> EndAuction(int id)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null) 
                    return Unauthorized();

                var item = dataOps.GetTrackedAuctionItemById(id);

                if (item == null) 
                    return NotFound();

                var isOwner = item.OwnerId == authenticatedUserId.Value;
                var isAdmin = User.IsInRole("Admin");
                if (!isOwner && !isAdmin) 
                    return Forbid();

                var endedItem = ProcessAuctionEnd(id, bidDataOps);

                var updatedItem = dataOps.GetAuctionItemById(id);
                return Ok(MapToResponseDto(updatedItem!));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}