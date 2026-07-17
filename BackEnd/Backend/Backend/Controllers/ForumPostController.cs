using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
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
            }
            }