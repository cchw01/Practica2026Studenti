namespace Backend.DTOs
{
    // Pentru GET 
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    // Pentru POST/PUT 
    public class CategoryCreateDto
    {
        public string Name { get; set; }
    }
}