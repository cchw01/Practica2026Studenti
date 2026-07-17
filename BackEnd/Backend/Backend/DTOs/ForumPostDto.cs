namespace Backend.DTOs
{
    public class ForumPostCreateDto
    {
        
        public string Title { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
    }
    public class ForumPostUpdateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }
    public class ForumPostResponseDto
    {
        public int Id { get; set; }

        public string UserName { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public int CommentsCount { get; set; }
    }

}
