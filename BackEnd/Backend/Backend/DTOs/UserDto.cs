using Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
 
    public class UserReadDto
    {
        public int ID { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public RoleEnum Role { get; set; }
        public float Rating { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public class UserUpdateDto
    {
        [StringLength(25, MinimumLength = 3, ErrorMessage = "UserName must be between 3 and 25 characters.")]
        public string UserName { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "Name can have a maximum of 50 characters.")]
        public string Name { get; set; } = string.Empty;
    }
}
