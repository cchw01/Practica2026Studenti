using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidController : ControllerBase
    {
        private readonly BidDataOps dataOps;
        private readonly ApplicationDbContext DbContext;
        public BidController(ApplicationDbContext dbContext)
        {
            DbContext = dbContext;
            dataOps = new BidDataOps(dbContext);
        }



        [HttpGet]
        public ActionResult<Bid[]> GetBids()
        {
            try
            {
                var bids = dataOps.GetBids();
                return Ok(bids);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<Bid> GetBid(int id)
        {
            try
            {
                var bid = dataOps.GetBidById(id);

                if (bid == null)
                    return NotFound();

                return Ok(bid);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult<Bid> AddBid(Bid bid)
        {
            try
            {
                var previousBids = dataOps.GetBidsByItemId(bid.BiddedItemId);
                var previousTopBid = previousBids
                    .OrderByDescending(b => b.price)
                    .FirstOrDefault();

                dataOps.AddBid(bid);

                var itemOps = new AuctionItemDataOps(DbContext);
                var item = itemOps.GetAuctionItemById(bid.BiddedItemId);
                var itemName = item != null ? item.Name : "an item";
                var notifOps = new NotificationDataOps(DbContext);

                //  notify the item owner that someone bid
                if (item != null && item.OwnerId != bid.BidderId)
                {
                    notifOps.Create(
                        item.OwnerId,
                        $"Someone placed a bid of {bid.price} on your item \"{itemName}\""
                    );
                }

                //  notify the previous top bidder that they got outbid
                if (previousTopBid != null
                    && previousTopBid.price < bid.price
                    && previousTopBid.BidderId != bid.BidderId)
                {
                    notifOps.Create(
                        previousTopBid.BidderId,
                        $"You've been outbid on \"{itemName}\" — new bid is {bid.price}. Bid again to stay in the race!"
                    );
                }

                return Ok(bid);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpPut]
        public ActionResult<Bid> UpdateBid(Bid bid)
        {
            try
            {
                dataOps.UpdateBid(bid);
                return Ok(bid);
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
                return BadRequest(ex.ToString());
            }
        }

        [HttpGet("item/{itemId}")]
        public ActionResult<Bid[]> GetBidsByItem(int itemId)
        {
            try
            {
                var bids = dataOps.GetBidsByItemId(itemId);
                return Ok(bids);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
