using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.DataManagement
{
    public class ProfileDataOps
    {
        private readonly ApplicationDbContext _db;

        public ProfileDataOps(ApplicationDbContext db)
        {
            _db = db;
        }

        public ProfileDto? GetProfileById(string userId)
        {
            if (!int.TryParse(userId, out var parsedUserId))
                return null;

            var user = _db.Users.Find(parsedUserId);
            if (user is null) return null;
            return BuildProfileDto(user);
        }

        public ProfileDto? GetProfileByUserName(string userName)
        {
            var user = _db.Users
                .AsNoTracking()
                .FirstOrDefault(u => u.UserName == userName);
            if (user is null) return null;
            return BuildProfileDto(user);
        }

        public List<ProfileDto> GetAllProfiles()
        {
            return _db.Users
                .AsNoTracking()
                .ToList()
                .Select(BuildProfileDto)
                .ToList();
        }

        public ProfileDto? UpdateProfile(string userId, UpdateProfileRequest request)
        {
            if (!int.TryParse(userId, out var parsedUserId))
                return null;

            var user = _db.Users.Find(parsedUserId);
            if (user is null) return null;

            if (!string.IsNullOrWhiteSpace(request.Name))
                user.Name = request.Name;

            if (!string.IsNullOrWhiteSpace(request.Email))
                user.Email = request.Email;

            _db.SaveChanges();
            return BuildProfileDto(user);
        }

        public List<ReviewDto> GetReviewsForUser(string userId)
        {
            if (!int.TryParse(userId, out var parsedUserId))
                return [];

            return _db.Reviews
                .AsNoTracking()
                .Where(r => r.ReviewedUserId == parsedUserId)
                .Select(r => MapReviewToDto(r))
                .ToList();
        }

        public List<ReviewDto> GetReviewsByUser(string userId)
        {
            if (!int.TryParse(userId, out var parsedUserId))
                return [];

            return _db.Reviews
                .AsNoTracking()
                .Where(r => r.ReviewerId == parsedUserId)
                .Select(r => MapReviewToDto(r))
                .ToList();
        }

        public ReviewDto AddReview(Review review)
        {
            _db.Reviews.Add(review);
            _db.SaveChanges();
            return MapReviewToDto(review);
        }

        public bool DeleteReview(string reviewId)
        {
            if (!int.TryParse(reviewId, out var parsedReviewId))
                return false;

            var review = _db.Reviews.Find(parsedReviewId);
            if (review is null) return false;
            _db.Reviews.Remove(review);
            _db.SaveChanges();
            return true;
        }

        public List<AuctionItemDto> GetAddedItemsByUser(string userId)
        {
            if (!int.TryParse(userId, out var parsedUserId))
                return [];

            return _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.OwnerId == parsedUserId)
                .Select(a => MapAuctionItemToDto(a))
                .ToList();
        }

        public List<AuctionItemDto> GetWonItemsByUser(string userId)
        {
            if (!int.TryParse(userId, out var parsedUserId))
                return [];

            return _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.WinnerId == parsedUserId)
                .Select(a => MapAuctionItemToDto(a))
                .ToList();
        }

        private ProfileDto BuildProfileDto(User user)
        {
            var reviewsReceived = _db.Reviews
                .AsNoTracking()
                .Where(r => r.ReviewedUserId == user.ID)
                .ToList();

            var addedItems = _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.OwnerId == user.ID)
                .ToList();

            var biddedItems = _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.WinnerId == user.ID)
                .ToList();

            double? avgRating = reviewsReceived.Count > 0
                ? Math.Round(reviewsReceived.Average(r => (double)r.Rating), 2)
                : null;

            return new ProfileDto
            {
                Id = user.ID.ToString(),
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                AverageRating = avgRating,
                TotalReviewsReceived = reviewsReceived.Count,
                ReviewsReceived = reviewsReceived.Select(r => MapReviewToDto(r)).ToList(),
                AddedItems = addedItems.Select(a => MapAuctionItemToDto(a)).ToList(),
                BiddedItems = biddedItems.Select(a => MapAuctionItemToDto(a)).ToList()
            };
        }

        private static ReviewDto MapReviewToDto(Review r) => new ReviewDto
        {
            Id = r.Id.ToString(),
            ReviewerId = r.ReviewerId.ToString(),
            RevieweeId = r.ReviewedUserId.ToString(),
            Score = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.ReviewDate
        };

        private static AuctionItemDto MapAuctionItemToDto(AuctionItem a) => new AuctionItemDto
        {
            ID = a.ID,
            Name = a.Name,
            StartPrice = a.StartPrice,
            CurrentPrice = a.CurrentPrice,
            Category = a.Category?.name ?? string.Empty,
            Status = a.Status.ToString(),
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            Owner = a.OwnerId.ToString()
        };
    }
}
