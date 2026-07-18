using Backend.DataManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationDataOps dataOps;
        public NotificationController(ApplicationDbContext DbContext) { dataOps = new NotificationDataOps(DbContext); }

        private int CurrentUserId => int.Parse(User.FindFirst("id")!.Value);


        [HttpPost("test/{userId}")]
        public ActionResult CreateTest(int userId)
        {
            dataOps.Create(userId, "Acesta este un test de notificare!");
            return Ok();
        }
        [HttpPost("read-all")]
        public ActionResult MarkAllRead()
        {
            dataOps.MarkAllAsRead(CurrentUserId);
            return Ok();
        }

        [HttpGet]
        public ActionResult GetMine() => Ok(dataOps.GetForUser(CurrentUserId));

        [HttpGet("has-unread")]
        public ActionResult HasUnread() => Ok(dataOps.HasUnread(CurrentUserId));

        [HttpPost("{id}/read")]
        public ActionResult MarkRead(int id) { dataOps.MarkAsRead(id); return Ok(); }


        [HttpPost("test")]
        public ActionResult CreateTest()
        {
            dataOps.Create(CurrentUserId, "Test notification ");
            return Ok();
        }
    }
}