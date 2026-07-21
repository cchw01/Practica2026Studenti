namespace Backend.DTOs
{
    public class ForumPostCreateDto
    {
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
    public class ForumPostUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
    public class ForumPostResponseDto
    {
        public int Id { get; set; }

        public string UserName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int CommentsCount { get; set; }
    }

}
