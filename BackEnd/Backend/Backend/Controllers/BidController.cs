using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidController : ControllerBase
    {
        private readonly BidDataOps dataOps;
        private readonly AuctionItemDataOps itemDataOps;
        private readonly NotificationDataOps notificationDataOps;

        public BidController(ApplicationDbContext DbContext)
        {
            dataOps = new BidDataOps(DbContext);
            itemDataOps = new AuctionItemDataOps(DbContext);
            notificationDataOps = new NotificationDataOps(DbContext);
        }



        [HttpGet]
        public ActionResult<BidDto[]> GetBids()
        {
            try
            {
                var bids = dataOps.GetBids();
                var bidDtos = bids.Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionItemId = b.BiddedItemId,
                    UserId = b.BidderId,
                    UserName = b.Bidder != null ? b.Bidder.UserName : "Unknown",
                    ItemName = b.BiddedItem != null ? b.BiddedItem.Name : "Unknown",
                    Price = b.Price,
                    Date = b.Date
                }).ToArray();

                return Ok(bidDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<BidDto> GetBid(int id)
        {
            try
            {
                var bid = dataOps.GetBidById(id);

                if (bid == null)
                    return NotFound();

                var bidDto = new BidDto
                {
                    Id = bid.Id,
                    AuctionItemId = bid.BiddedItemId,
                    UserId = bid.BidderId,
                    UserName = bid.Bidder != null ? bid.Bidder.UserName : "Unknown",
                    ItemName = bid.BiddedItem != null ? bid.BiddedItem.Name : "Unknown",
                    Price = bid.Price,
                    Date = bid.Date
                };

                return Ok(bidDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [Authorize]
        public ActionResult<BidDto> AddBid(CreateBidDto bidDto)
        {
            try
            {
                var item = itemDataOps.GetTrackedAuctionItemById(
                    bidDto.AuctionItemId
                );

                if (item == null)
                    return NotFound("Item not found.");

                if (DateTime.Now > item.EndDate)
                    return BadRequest("Auction has ended.");

                if (bidDto.Price <= item.CurrentPrice)
                {
                    return BadRequest(
                        $"Price must be higher than the current price ({item.CurrentPrice})."
                    );
                }

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");

                if (userIdClaim == null)
                    return Unauthorized("You must be logged in to place a bid.");

                if (!int.TryParse(userIdClaim.Value, out int currentUserId))
                    return Unauthorized("Invalid user identification.");

                var previousHighestBid = dataOps.GetHighestBidByItemId(
                    bidDto.AuctionItemId
                );

                var newBid = new Bid
                {
                    BiddedItemId = bidDto.AuctionItemId,
                    BidderId = currentUserId,
                    Price = bidDto.Price,
                    Date = DateTime.Now
                };

                dataOps.AddBid(newBid);

                item.CurrentPrice = bidDto.Price;
                item.Status = AuctionItem.StatusEnum.ActiveBid;

                itemDataOps.SaveChanges();

                if (
                    previousHighestBid != null &&
                    previousHighestBid.BidderId != currentUserId
                )
                {
                    notificationDataOps.Create(
                        previousHighestBid.BidderId,
                        $"Someone placed a higher bid than yours on \"{item.Name}\"."
                    );
                }

                return Ok(new BidDto
                {
                    Id = newBid.Id,
                    AuctionItemId = newBid.BiddedItemId,
                    UserId = newBid.BidderId,
                    UserName = string.Empty,
                    ItemName = item.Name,
                    Price = newBid.Price,
                    Date = newBid.Date
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteBid(int id)
        {
            try
            {
                dataOps.DeleteBid(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("item/{itemId}")]
        public ActionResult<BidDto[]> GetBidsByItem(int itemId)
        {
            try
            {
                var bids = dataOps.GetBidsByItemId(itemId);
                var bidDtos = bids.Select(b => new BidDto
                {
                    Id = b.Id,
                    AuctionItemId = b.BiddedItemId,
                    UserId = b.BidderId,
                    UserName = b.Bidder != null ? b.Bidder.UserName : "Unknown",
                    ItemName = b.BiddedItem != null ? b.BiddedItem.Name : "Unknown",
                    Price = b.Price,
                    Date = b.Date
                }).ToArray();
                return Ok(bidDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
