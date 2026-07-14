using Backend.DataManagement;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

    namespace Backend.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        public class UserController : ControllerBase
        {
            private readonly UserDataOps dataOps;
            private readonly TokenProvider tokenProvider;
            public UserController(ApplicationDbContext DbContext, TokenProvider tokenProvider)
            {
                dataOps = new UserDataOps(DbContext);
                this.tokenProvider = tokenProvider;
            }

            [HttpGet]
            public ActionResult<User> GetUsers()
            {
                try
                {
                    var users = dataOps.GetUsers();
                    return Ok(users);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpGet("{id}")]
            public ActionResult<User> GetUser(int id)
            {
                try
                {
                    var user = dataOps.GetUserById(id);

                    if (user == null)
                        return NotFound();

                    return Ok(user);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpPost]
            public ActionResult<User> AddUser(User user)
            {
                try
                {
                    dataOps.AddUser(user);
                    return Ok(user);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpPut]
            public ActionResult<User> UpdateUser(User user)
            {
                try
                {
                    dataOps.UpdateUser(user);
                    return Ok(user);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpDelete("{id}")]
            public ActionResult DeleteUser(int id)
            {
                try
                {
                    dataOps.DeleteUser(id);
                    return Ok();
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.ToString());
                }
            }
        }
    }