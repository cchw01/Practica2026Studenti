namespace Backend.DTOs
{
    public class ProfilePictureDto
    {
        public string Name { get; set; }
        public IFormFile Picture { get; set; }
    }
}
