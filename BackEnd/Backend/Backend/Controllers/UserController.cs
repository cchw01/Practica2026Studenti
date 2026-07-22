using Azure.Core;
    using Backend.DataManagement;
    using Backend.DTOs;
    using Backend.Models;
    using Backend.Services;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        public class UserController : ControllerBase
        {
            private readonly UserDataOps dataOps;
            private readonly RefreshTokenDataOps refreshTokenDataOps;
            private readonly TokenProvider tokenProvider;
            private const int EXPIRES_IN = 900;
            public UserController(ApplicationDbContext DbContext, TokenProvider tokenProvider, RefreshTokenDataOps refreshTokenDataOps)
            {
                dataOps = new UserDataOps(DbContext);
                this.tokenProvider = tokenProvider;
                this.refreshTokenDataOps = refreshTokenDataOps;
            }

            [HttpGet]
        public ActionResult<IEnumerable<UserReadDto>> GetUsers()
        {
                try
                {
                    var users = dataOps.GetUsers();
                    var userDtos = users.Select(u => new UserReadDto
                    {
                        ID = u.ID,
                        UserName = u.UserName,
                        Name = u.Name,
                        Email = u.Email,
                        Role = u.Role,
                        Rating = u.Rating,
                        PhoneNumber = u.PhoneNumber
                    }).ToArray();
                    return Ok(userDtos);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpGet("{id}")]
            public ActionResult<UserReadDto> GetUser(int id)
            {
                try
                {
                    var user = dataOps.GetUserById(id);

                    if (user == null)
                        return NotFound();

                    var userDto = new UserReadDto
                    {
                        ID = user.ID,
                        UserName = user.UserName,
                        Name = user.Name,
                        Email = user.Email,
                        Role = user.Role,
                        Rating = user.Rating,
                        PhoneNumber = user.PhoneNumber
                    };

                    return Ok(userDto);
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
                if (dataOps.EmailExists(request.Email))
                    return BadRequest(new { message = "This mail is already registered" });

                var existingUser = dataOps.GetUserByUsername(request.UserName);
                if (existingUser != null)
                    return BadRequest(new { message = "This username is already in use" });

                if (dataOps.PhoneNumberExists(request.PhoneNumber))
                    return BadRequest(new { message = "This phone number is already in use" });
                    
                var user = new User
                {
                    UserName = request.UserName,
                    Name = request.Name,
                    Email = request.Email,
                    Password = PasswordHasher.HashPassword(request.Password),
                    Role = RoleEnum.User,
                    PhoneNumber = request.PhoneNumber
                };

                dataOps.AddUser(user);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
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
                if (user.IsBanned)
                    return Unauthorized("Contul tău a fost suspendat.");

                bool parolaCorecta = PasswordHasher.VerifyPassword(request.Password, user.Password);

                if (!parolaCorecta)
                    return Unauthorized("Email sau parolă incorectă.");
                var token = tokenProvider.GenerateAccesToken(user);
                RefreshToken? refreshToken = refreshTokenDataOps.CreateRefreshToken(user);
                var refreshTokenCookie = new CookieOptions
                {
                    Expires = refreshToken.ExpiresAt,
                    HttpOnly = true,
                    Secure = true,
                };
                Response.Cookies.Append("refreshToken", refreshToken.Token, refreshTokenCookie);
                var tokenInfo = new { accessToken = token, expiresIn = EXPIRES_IN };
                return Ok(tokenInfo);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("regenerate-token")]
        public ActionResult RegenerateAccessToken()
        {
            try
            {

                var refreshTokenFromRequest = Request.Cookies["refreshToken"];
                if(refreshTokenFromRequest==null)
                {
                    return Unauthorized("Refresh token invalid, se redirectioneaza la Login");
                }
                var token = refreshTokenDataOps.GetRefreshTokenByToken(refreshTokenFromRequest);
                if(token==null)
                {
                    return Unauthorized("Refresh token invalid, se redirectioneaza la Login");
                }
                var user = dataOps.GetUserById(token.UserId);
                if (user==null)
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
                else if(refreshToken.Token == refreshTokenFromRequest)
                {
                    var accessToken = tokenProvider.GenerateAccesToken(user);
                    Response.Cookies.Delete("refreshToken");
                    var newRefreshToken = refreshTokenDataOps.CreateRefreshToken(user);
                    var refreshTokenCookie = new CookieOptions
                    {
                        Expires = newRefreshToken?.ExpiresAt ?? DateTime.UtcNow.AddDays(30),
                        HttpOnly = true,
                        Secure = true,
                    };
                    Response.Cookies.Append("refreshToken", newRefreshToken?.Token ?? string.Empty, refreshTokenCookie);
                    var tokenInfo = new { accessToken, expiresIn = EXPIRES_IN };
                    return Ok(tokenInfo);
                }
                else
                {
                    return Unauthorized("Refresh Token expirat sau invalid, se redirectioneaza la Login");
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("{id}")]
        public ActionResult<UserReadDto> UpdateUser(int id, [FromBody] UserUpdateDto request)
        {
            try
            {
                var user = dataOps.GetUserById(id);
                if (user == null)
                    return NotFound("Utilizatorul nu a fost găsit.");

                if (user.UserName != request.UserName)
                {
                    var userWithSameUsername = dataOps.GetUserByUsername(request.UserName);
                    if (userWithSameUsername != null)
                    {
                        return BadRequest("Acest username este deja folosit de un alt utilizator.");
                    }
                    user.UserName = request.UserName;
                }

                user.Name = request.Name;

                dataOps.UpdateUser(user);

                var userRead = new UserReadDto
                {
                    ID = user.ID,
                    UserName = user.UserName,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    Rating = user.Rating,
                    PhoneNumber=user.PhoneNumber
                };

                return Ok(userRead);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "Admin")]
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

        [HttpPost("logout")]
        public ActionResult LogoutUser()
        {
            try
            {
                var refreshTokenFromRequest = Request.Cookies["refreshToken"];
                if (!string.IsNullOrEmpty(refreshTokenFromRequest))
                {
                    var token = refreshTokenDataOps.GetRefreshTokenByToken(refreshTokenFromRequest);
                    if (token != null)
                    {
                        var userToken = dataOps.GetUserById(token.UserId);
                        if (userToken != null)
                            refreshTokenDataOps.DeleteRefreshToken(userToken);
                    }
                }
                Response.Cookies.Delete("refreshToken");
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{userId}/wishlist")]
        public ActionResult<IEnumerable<AuctionItemResponseDto>> GetWishlist(int userId)
        {
            try
            {
                var wishlist = dataOps.GetWishlist(userId);
                if (wishlist == null)
                    return NotFound("Utilizatorul nu a fost găsit.");

                var response = wishlist.Select(item => new AuctionItemResponseDto
                {
                    ID = item.ID,
                    Name = item.Name,
                    StartPrice = item.StartPrice,
                    CurrentPrice = item.CurrentPrice,
                    CategoryId = item.CategoryId,
                    CategoryName = item.Category?.name ?? string.Empty,
                    Description = item.Description,
                    Location = item.Location,
                    OwnerId = item.OwnerId,
                    OwnerUserName = item.Owner?.UserName ?? string.Empty,
                    WinnerId = item.WinnerId,
                    WinnerUserName = item.Winner?.UserName,
                    Status = item.Status,
                    StartDate = item.StartDate,
                    EndDate = item.EndDate,
                    ImageUrl = item.ImageUrl
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{userId}/wishlist/{itemId}")]
        public ActionResult AddToWishlist(int userId, int itemId)
        {
            try
            {
                var result = dataOps.AddToWishlist(userId, itemId);
                if (!result)
                    return BadRequest("Nu s-a putut adăuga produsul în wishlist.");
                return Ok();
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
                var result = dataOps.RemoveFromWishlist(userId, itemId);
                if (!result)
                    return BadRequest("Nu s-a putut șterge produsul din wishlist.");
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

            
        
    