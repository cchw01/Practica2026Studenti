using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using Backend.DTOs;
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

        public AuctionItemController(ApplicationDbContext dbContext)
        {
            dataOps = new AuctionItemDataOps(dbContext);
            categoryDataOps = new CategoryDataOps(dbContext);
            userDataOps = new UserDataOps(dbContext);
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

        [Authorize]
        [HttpPost]
        public ActionResult<AuctionItemResponseDto> AddAuctionItem(CreateAuctionItemDto dto)
        {
            try
            {
                var authenticatedUserId = GetAuthenticatedUserId();

                if (authenticatedUserId == null)
                    return Unauthorized();

                var owner = userDataOps.GetUserById(authenticatedUserId.Value);

                if (owner == null)
                    return Unauthorized("Utilizatorul autentificat nu există.");

                var category = categoryDataOps.GetCategoryById(dto.CategoryId);

                if (category == null)
                    return BadRequest("Categoria specificată nu există.");

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
                    return BadRequest("Itemul a fost salvat, dar nu a putut fi citit.");

                var response = MapToResponseDto(createdItem);

                return CreatedAtAction(
                    nameof(GetAuctionItemById),
                    new { id = response.ID },
                    response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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

                var isOwner = item.OwnerId == authenticatedUserId.Value;
                var isAdmin = User.IsInRole("Admin");

                if (!isOwner && !isAdmin)
                    return Forbid();

                var category = categoryDataOps.GetCategoryById(dto.CategoryId);

                if (category == null)
                    return BadRequest("Categoria specificată nu există.");

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

                var isOwner = item.OwnerId == authenticatedUserId.Value;
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
                return BadRequest(ex.Message);
            }
        }

        private int? GetAuthenticatedUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return null;

            return userId;
        }

        private static AuctionItemResponseDto MapToResponseDto(AuctionItem item)
        {
            return new AuctionItemResponseDto
            {
                ID = item.ID,
                Name = item.Name,
                StartPrice = item.StartPrice,
                CurrentPrice = item.CurrentPrice,
                CategoryId = item.CategoryId,
                CategoryName = item.Category?.name ?? string.Empty,
                Description = item.Description,
                Location = item.Location,
                OwnerId = item.OwnerId,
                OwnerUserName = item.Owner?.UserName ?? string.Empty,
                WinnerId = item.WinnerId,
                WinnerUserName = item.Winner?.UserName,
                Status = item.Status,
                StartDate = item.StartDate,
                EndDate = item.EndDate
            };
        }
    }
}