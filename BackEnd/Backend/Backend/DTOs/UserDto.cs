using Backend.Models;

namespace Backend.DTOs
{
 
    public class UserReadDto
    {
        public int ID { get; set; }
        public string UserName { get; set; } 
        public string Name { get; set; }
        public string Email { get; set; } 
        public RoleEnum Role { get; set; }
        public float Rating { get; set; }
        public string? PhoneNumber { get; set; }
    }

    public class UserUpdateDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
