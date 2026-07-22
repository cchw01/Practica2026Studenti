using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class LoginDto
    {
<<<<<<< HEAD
        public string UserName { get; set; }
        public string Password { get; set; }
=======
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        public string Password { get; set; } = string.Empty;
>>>>>>> ac1cf0e7929a56e7ae04d9849f400fe098d0475f
    }
}