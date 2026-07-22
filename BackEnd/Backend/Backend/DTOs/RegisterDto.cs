using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "UserName is required.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "UserName must be between 3 and 50 characters.")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name can have a maximum of 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string Password { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}