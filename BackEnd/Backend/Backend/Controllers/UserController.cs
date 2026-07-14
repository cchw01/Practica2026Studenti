    using Backend.DataManagement;
    using Backend.Models;
    using Microsoft.AspNetCore.Mvc;
    using Backend.Services;
    using Backend.DTOs;

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

        [HttpPost("register")]
        public ActionResult<User> Register(RegisterDto request)
        {
            try
            {
                var existingUser = dataOps.GetUserByUsername(request.UserName);
                if (existingUser != null)
                    return BadRequest("Acest username este deja folosit.");

                var user = new User
                {
                    UserName = request.UserName,
                    Name = request.Name,
                    Email = request.Email,
                    Password = PasswordHasher.HashPassword(request.Password),
                    Role = RoleEnum.User
                };

                dataOps.AddUser(user);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public ActionResult Login(LoginDto request)
        {
            try
            {
                var user = dataOps.GetUserByEmail(request.Email);

                if (user == null)
                    return Unauthorized("Email sau parolă incorectă.");

                bool parolaCorecta = PasswordHasher.VerifyPassword(request.Password, user.Password);

                if (!parolaCorecta)
                    return Unauthorized("Email sau parolă incorectă.");
                var token = tokenProvider.Create(user);
                return Ok(token);
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



        [HttpPost("{userId}/wishlist/{itemId}")]
        public ActionResult AddToWishlist(int userId, int itemId)
        {
            try
            {
                var added = dataOps.AddToWishlist(userId, itemId);

                if (!added)
                    return BadRequest("Userul sau itemul nu există, sau itemul este deja în wishlist.");

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{userId}/wishlist")]
        public ActionResult<AuctionItem[]> GetWishlist(int userId)
        {
            try
            {
                var wishlist = dataOps.GetWishlist(userId);

                if (wishlist == null)
                    return NotFound();

                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{userId}/wishlist/{itemId}")]
        public ActionResult RemoveFromWishlist(int userId, int itemId)
        {
            try
            {
                var removed = dataOps.RemoveFromWishlist(userId, itemId);

                if (!removed)
                    return NotFound();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

            
        
    