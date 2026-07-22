namespace Backend.Models
{
    public class ProfilePicture
    {
        internal string? name;

        public int Id { get; set; }
        public string PictureBase64 { get; set; }
    }
}
