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
            private readonly RefreshTokenDataOps refreshTokenDataOps;
            private readonly TokenProvider tokenProvider;
            public UserController(ApplicationDbContext DbContext, TokenProvider tokenProvider, RefreshTokenDataOps refreshTokenDataOps)
            {
                dataOps = new UserDataOps(DbContext);
                this.tokenProvider = tokenProvider;
                this.refreshTokenDataOps = refreshTokenDataOps;
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
                var token = tokenProvider.GenerateAccesToken(user);
                refreshTokenDataOps.CreateRefreshToken(user);
                return Ok(token);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost]
        public ActionResult RegenerateAccessToken(int userId)
        {
            try
            {
                var user = dataOps.GetUserById(userId);
                if(user==null)
                {
                    return Unauthorized("Utilizator neconectat");
                }
                var refreshToken = refreshTokenDataOps.GetRefreshToken(user);
                if(refreshToken == null)
                {
                    return Unauthorized("Refresh Token invalid, se redirectioneaza la Login");
                }
                else if(refreshToken.ExpiresAt < DateTime.Now)
                {
                    return Unauthorized("Refresh Token expirat, se redirectioneaza la Login");
                }
                else
                {
                    var accessToken = tokenProvider.GenerateAccesToken(user);
                    return Ok(accessToken);
                }
            }
            catch(Exception ex)
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

            
        
    