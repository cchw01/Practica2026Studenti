using Backend.DataManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
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
        public ActionResult<ForumPost> GetForumPostById(int id)
        {
            try
            {
                var forumPost = dataOps.GetForumPostById(id);
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
        [Authorize(Roles = "Admin")]
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
