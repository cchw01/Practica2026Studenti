using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // Pentru GET 
    public class CategoryDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }

    // Pentru POST/PUT 
    public class CategoryCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }
}