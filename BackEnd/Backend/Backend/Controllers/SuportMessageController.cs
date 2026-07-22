using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    public class SupportMessageCreateDto
    {
        public string Source { get; set; } = "Contact";
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string? IssueType { get; set; }
        public string Message { get; set; } = "";
    }

    public class ResolveDto
    {
        public string? ReplyMessage { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class SupportMessageController : ControllerBase
    {
        private readonly SupportMessageDataOps dataOps;
        public SupportMessageController(ApplicationDbContext dbContext) { dataOps = new SupportMessageDataOps(dbContext); }


        [HttpPost]
        public ActionResult Submit([FromBody] SupportMessageCreateDto dto)
        {
            try
            {
                int? userId = null;
                var idClaim = User.FindFirst("id");
                if (idClaim != null && int.TryParse(idClaim.Value, out var parsedId))
                {
                    userId = parsedId;
                }

                var msg = new SupportMessage
                {
                    Source = dto.Source,
                    Name = dto.Name,
                    Email = dto.Email,
                    IssueType = dto.IssueType,
                    Message = dto.Message,
                    UserId = userId,
                };

                dataOps.Create(msg);
                return Ok();
            }
            catch (Exception ex)
            {
                string errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(errorMessage);
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("contact")]
        public ActionResult GetContactMessages() => Ok(dataOps.GetBySource("Contact"));

        [Authorize(Roles = "Admin")]
        [HttpGet("help")]
        public ActionResult GetHelpMessages() => Ok(dataOps.GetBySource("Help"));

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/resolve")]
        public ActionResult Resolve(int id, [FromBody] ResolveDto dto)
        {
            try
            {
                dataOps.ResolveWithReply(id, dto.ReplyMessage);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}