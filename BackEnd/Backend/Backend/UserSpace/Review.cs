namespace Backend.UserSpace
{
    public class Review
    {
        
        public string Id { get; set; }

        public string ReviewerId { get; set; }
        
        public string RevieweeId { get; set; }

        public float Score { get; set; }

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; }

        public Review(string id, string reviewerId, string revieweeId, float score, string comment)
        {
            Id = id;
            ReviewerId = reviewerId;
            RevieweeId = revieweeId;
            Score = score;
            Comment = comment;
            CreatedAt = DateTime.UtcNow;
        }

        public override string ToString()
        {
            return $"Review{{Id='{Id}', ReviewerId='{ReviewerId}', RevieweeId='{RevieweeId}', Score={Score}}}";
        }
    }
}
    

