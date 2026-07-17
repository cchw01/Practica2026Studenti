namespace Backend.DTOs
{
    public class AddPictureDto
    {
        public string Name { get; set; }
        public IFormFile Picture { get; set; }
    }
}
