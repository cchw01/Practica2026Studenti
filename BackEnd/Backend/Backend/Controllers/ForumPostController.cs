using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Backend.Controllers

{
    [ApiController]
    [Route("api/[controller]")]
    public class ForumPostController : ControllerBase
    {
        private readonly ForumPostDataOps dataOps;
        private readonly ApplicationDbContext dbContext;

        public ForumPostController(ApplicationDbContext DbContext)
        {
            dbContext = DbContext;
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


        [Authorize]
        [HttpPut("{id}")]
        public ActionResult UpdateForumPost(int id, [FromBody] ForumPostUpdateDto updateDto)
        {
            try
            {
                var forumPost = dataOps.GetForumPostById(id);
                if (forumPost == null) return NotFound();

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
                var roleClaim = User.Claims.FirstOrDefault(c => c.Type == "role");
                if (userIdClaim == null) return Unauthorized();

                int currentUserId = int.Parse(userIdClaim.Value);
                bool isAdmin = roleClaim?.Value == "Admin";
                bool isAuthor = forumPost.UserId == currentUserId;

                if (!isAuthor && !isAdmin) return Forbid();

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
        [Authorize]
        [HttpDelete("{id}")]
        public ActionResult DeleteForumPost(int id)
        {
            try
            {
                var post = dataOps.GetForumPostById(id);
                if (post == null) return NotFound();

                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "id");
                var roleClaim = User.Claims.FirstOrDefault(c => c.Type == "role");

                if (userIdClaim == null) return Unauthorized();

                int currentUserId = int.Parse(userIdClaim.Value);
                bool isAdmin = roleClaim?.Value == "Admin";
                bool isAuthor = post.UserId == currentUserId;

                if (!isAuthor && !isAdmin)
                    return Forbid();

                if (isAdmin && !isAuthor)
                {
                    var notifOps = new NotificationDataOps(dbContext);
                    notifOps.Create(post.UserId, "PostDeleted", new { postTitle = post.Title });
                }

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