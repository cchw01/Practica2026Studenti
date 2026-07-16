using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidController : ControllerBase
    {
        private readonly BidDataOps dataOps;

        public BidController(ApplicationDbContext DbContext)
        {
            dataOps = new BidDataOps(DbContext);
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
                dataOps.AddBid(bid);
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
