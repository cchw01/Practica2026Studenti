using Backend.DataManagement;
using Backend.Models;
using Backend.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
        public ActionResult<ForumCommentDto[]> GetForumComments()
        {
            try
            {
                var comments = dataOps.GetForumComments();
                if (comments == null) return NotFound();

                var dtos = comments.Select(c => new ForumCommentDto
                {
                    Id = c.Id,
                    ForumPostId = c.ForumPostId,
                    UserId = c.UserId,
                    UserName = c.User?.UserName ?? string.Empty,
                    Date = c.Date,
                    CommentText = c.CommentText
                }).ToArray();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("post/{postid}")]
        public ActionResult<ForumCommentDto[]> GetForumCommentsByPostId(int postid)
        {
            try
            {
                if (!dataOps.DoesPostExist(postid))
                {
                    return NotFound("Post does not exist.");
                }

                var comments = dataOps.GetCommentsByPostId(postid);
                if (comments == null) return NotFound();

                var dtos = comments.Select(c => new ForumCommentDto
                {
                    Id = c.Id,
                    ForumPostId = c.ForumPostId,
                    UserId = c.UserId,
                    UserName = c.User?.UserName ?? string.Empty,
                    Date = c.Date,
                    CommentText = c.CommentText
                }).ToArray();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public ActionResult<ForumCommentDto> GetForumComment(int id)
        {
            try
            {
                var comment = dataOps.GetForumCommentById(id);
                if (comment == null)
                    return NotFound();

                var dto = new ForumCommentDto
                {
                    Id = comment.Id,
                    ForumPostId = comment.ForumPostId,
                    UserId = comment.UserId,
                    UserName = comment.User?.UserName ?? string.Empty,
                    Date = comment.Date,
                    CommentText = comment.CommentText
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult AddForumComment(CreateForumCommentDto createDto)
        {
            try
            {
                if (!dataOps.DoesPostExist(createDto.ForumPostId))
                {
                    return BadRequest("Post does not exist.");
                }

                var newComment = new ForumComment
                {
                    ForumPostId = createDto.ForumPostId,
                    UserId = createDto.UserId,
                    CommentText = createDto.CommentText,
                    Date = DateTime.Now
                };

                dataOps.AddForumComment(newComment);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public ActionResult UpdateForumComment(int id, UpdateForumCommentDto updateDto)
        {
            try
            {
                var existingComment = dataOps.GetForumCommentById(id);
                if (existingComment == null) return NotFound("Comment not found.");

                existingComment.CommentText = updateDto.CommentText;
                
                dataOps.UpdateForumComment(existingComment);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "Admin")]
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
