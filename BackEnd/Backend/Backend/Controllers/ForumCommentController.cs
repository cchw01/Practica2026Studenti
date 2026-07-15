using Backend.DataManagement;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumCommentController : ControllerBase
    {
        private readonly ForumCommentDataOps dataOps;

        public ForumCommentController(ApplicationDbContext DbContext)
        {
            dataOps = new ForumCommentDataOps(DbContext);
        }
        [HttpGet]
        public ActionResult<ForumComment[]> GetForumComments()
        {
            try
            {
                var comments = dataOps.GetForumComments();
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("post/{postid}")]
        public ActionResult<ForumComment[]> GetForumCommentsByPostId(int postid)
        {
            try
            {
                var comments = dataOps.GetCommentsByPostId(postid);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public ActionResult<ForumComment> GetForumComment(int id)
        {
            try
            {
                var comment = dataOps.GetForumCommentById(id);
                if (comment == null)
                    return NotFound();
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        public ActionResult<ForumComment> AddForumComment(ForumComment forumComment)
        {
            try
            {
                dataOps.AddForumComment(forumComment);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        public ActionResult<ForumComment> UpdateForumComment(ForumComment forumComment)
        {
            try
            {
                dataOps.UpdateForumComment(forumComment);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("{id}")]
        public ActionResult DeleteForumComment(int id)
        {
            try
            {
                dataOps.DeleteForumComment(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
