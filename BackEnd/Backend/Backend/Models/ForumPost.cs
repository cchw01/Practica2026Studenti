using System;
namespace Backend.Models
{
	public class ForumPost
	{
		public int Id { get; set; }
		public int UserId { get; set; }
		public DateTime Date { get; set; }
		public string Title { get; set; }
		public string Description { get; set; }
        //public List<ForumComment> Comments { get; set;  } = new List<ForumComment>();
		// TODO: Add photos
    }
}
