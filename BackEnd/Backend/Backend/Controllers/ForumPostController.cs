using Backend.DataManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumPostController : ControllerBase
    {
        private readonly ForumPostDataOps dataOps;

        public ForumPostController(ApplicationDbContext DbContext)
        {
            dataOps = new ForumPostDataOps(DbContext);
        }

        [HttpGet]
        public ActionResult<ForumPost> GetForumPosts()
        {
            try
            {
                var forumPosts = dataOps.GetForumPosts();
                return Ok(forumPosts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public ActionResult<ForumPost> GetForumPost(int id)
        {
            try
            {
                var forumPost = dataOps.GetForumPost(id);
                if (forumPost == null)
                {
                    return NotFound();
                }
                return Ok(forumPost);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        public ActionResult<ForumPost> AddForumPost(ForumPost forumPost)
        {
            try
            {
                dataOps.AddForumPost(forumPost);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        public ActionResult<ForumPost> UpdateForumPost(ForumPost forumPost)
        {
            try
            {
                dataOps.UpdateForumPost(forumPost);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
    [HttpDelete("{id}")]
        public ActionResult<ForumPost> DeleteForumPost(int id)
        {
            try
            {
                dataOps.DeleteForumPost(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
