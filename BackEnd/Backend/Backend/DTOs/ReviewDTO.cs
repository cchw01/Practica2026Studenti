namespace Backend.DTOs
{
    public class ReviewDTO
    {
        public int Id { get; set; }

        public int ReviewerId { get; set; }
        public string ReviewerUserName { get; set; }

        public int ReviewedUserId { get; set; }
        public string ReviewedUserUserName { get; set; }

        public float Rating { get; set; }
        public string Comment { get; set; }

        public DateTime ReviewDate { get; set; }
    }

    public class ReviewCreateDTO
    {
        public int ReviewerId { get; set; }
        public int ReviewedUserId { get; set; }
        public float Rating { get; set; }
        public string Comment { get; set; }
    }
}