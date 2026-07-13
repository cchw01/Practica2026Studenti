using Backend.Data;
using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuctionItemController : ControllerBase
    {
        private readonly AuctionItemDataOps dataOps;

        public AuctionItemController(ApplicationDbContext dbContext)
        {
            dataOps = new AuctionItemDataOps(dbContext);
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
        //not found
        [HttpPost]
        public ActionResult<AuctionItem> AddAuctionItem(AuctionItem item)
        {
            dataOps.AddAuctionItem(item);
            return Ok();
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