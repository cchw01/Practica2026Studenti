using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminDataOps dataOps;
        public AdminController(ApplicationDbContext dbContext) { dataOps = new AdminDataOps(dbContext); }

        [HttpGet("stats")]
        public ActionResult GetStats() => Ok(dataOps.GetStats());

        [HttpGet("users")]
        public ActionResult GetUsers() => Ok(dataOps.GetAllUsers());

        [HttpPost("users/{id}/role")]
        public ActionResult SetRole(int id, [FromBody] RoleEnum role)
        {
            try { dataOps.SetUserRole(id, role); return Ok(); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("users/{id}/ban")]
        public ActionResult BanUser(int id)
        {
            try { dataOps.SetBanned(id, true); return Ok(); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("users/{id}/unban")]
        public ActionResult UnbanUser(int id)
        {
            try { dataOps.SetBanned(id, false); return Ok(); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("auctions/{id}/validate")]
        public ActionResult ValidateAuction(int id)
        {
            try { dataOps.SetAuctionStatus(id, AuctionItem.StatusEnum.Validated); return Ok(); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("auctions/{id}/reject")]
        public ActionResult RejectAuction(int id)
        {
            try { dataOps.SetAuctionStatus(id, AuctionItem.StatusEnum.Rejected); return Ok(); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpDelete("forum-posts/{id}")]
        public ActionResult DeletePost(int id)
        {
            dataOps.DeleteForumPost(id);
            return Ok();
        }

        [HttpDelete("forum-comments/{id}")]
        public ActionResult DeleteComment(int id)
        {
            dataOps.DeleteForumComment(id);
            return Ok();
        }
    }
}