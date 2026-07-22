using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // Pentru GET 
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    // Pentru POST/PUT 
    public class CategoryCreateDto
    {
        [Required(ErrorMessage = "Category name is required.")]
        [StringLength(
            25,
            ErrorMessage = "Category name can have a maximum of 25 characters.")]
        public string Name { get; set; } = string.Empty;
    }
}