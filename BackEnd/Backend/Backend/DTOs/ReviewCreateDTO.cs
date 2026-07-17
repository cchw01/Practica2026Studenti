namespace Backend.DTOs
{
    public class ReviewCreateDTO
    {
        public int ReviewerId { get; set; }
        public int ReviewedUserId { get; set; }
        public float Rating { get; set; }
        public string Comment { get; set; }
    }
}