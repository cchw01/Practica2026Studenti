using Backend.DataManagement;
using Backend.DTOs;
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
        public ActionResult<IEnumerable<ForumPostResponseDto>> GetForumPosts()
        {
            try
            {
                var forumPosts = dataOps.GetForumPosts();
                var dtos = forumPosts?.Select(fp => new ForumPostResponseDto
                {
                    Id = fp.Id,
                    UserId = fp.UserId,
                    UserName = fp.User?.UserName ?? "Unknown",
                    Title = fp.Title,
                    Description = fp.Description,
                    Date = fp.Date,
                    CommentsCount = fp.Comments?.Count ?? 0
                }).ToList();
                
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<ForumPostResponseDto> GetForumPostById(int id)
        {
            try
            {
                var forumPost = dataOps.GetForumPostById(id);
                if (forumPost == null)
                {
                    return NotFound();
                }

                var dto = new ForumPostResponseDto
                {
                    Id = forumPost.Id,
                    UserId = forumPost.UserId,
                    UserName = forumPost.User?.UserName ?? "Unknown",
                    Title = forumPost.Title,
                    Description = forumPost.Description,
                    Date = forumPost.Date,
                    CommentsCount = forumPost.Comments?.Count ?? 0
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult AddForumPost([FromBody] ForumPostCreateDto createDto)
        {
            try
            {
                var forumPost = new ForumPost
                {
                    Title = createDto.Title,
                    Description = createDto.Description,
                    UserId = createDto.UserId,
                    Date = DateTime.Now 
                };

                dataOps.AddForumPost(forumPost);
                return Ok(forumPost);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public ActionResult UpdateForumPost(int id, [FromBody] ForumPostUpdateDto updateDto)
        {
            try
            {
                var forumPost = dataOps.GetForumPostById(id);
                if (forumPost == null)
                {
                    return NotFound();
                }

                forumPost.Title = updateDto.Title;
                forumPost.Description = updateDto.Description;

                dataOps.UpdateForumPost(forumPost);
                return Ok(forumPost);
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