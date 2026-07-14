using Backend.Models;
using Backend.UserDBContext;
using Backend.UserSpace;
using Microsoft.EntityFrameworkCore;
using UserSpaceReview = Backend.UserSpace.Review;

namespace Backend.DataManagement
{
    public class ProfileDataOps
    {
        private readonly ProfileDBContextClass _db;

        public ProfileDataOps(ProfileDBContextClass db)
        {
            _db = db;
        }

        public ProfileDto? GetProfileById(string userId)
        {
            var user = _db.Users.Find(userId);
            if (user is null) return null;
            return BuildProfileDto(user);
        }

        public ProfileDto? GetProfileByUserName(string userName)
        {
            var user = _db.Users
                .AsNoTracking()
                .FirstOrDefault(u => u.userName == userName);
            if (user is null) return null;
            return BuildProfileDto(user);
        }

        public List<ProfileDto> GetAllProfiles()
        {
            return _db.Users
                .AsNoTracking()
                .Select(u => new ProfileDto
                {
                    Id = u.id,
                    UserName = u.userName,
                    Name = u.name,
                    Email = u.email
                })
                .ToList();
        }

        public ProfileDto? UpdateProfile(string userId, UpdateProfileRequest request)
        {
            var user = _db.Users.Find(userId);
            if (user is null) return null;

            if (!string.IsNullOrWhiteSpace(request.Name))
                user.name = request.Name;

            if (!string.IsNullOrWhiteSpace(request.Email))
                user.email = request.Email;

            _db.SaveChanges();
            return BuildProfileDto(user);
        }

        public List<ReviewDto> GetReviewsForUser(string userId)
        {
            return _db.Reviews
                .AsNoTracking()
                .Where(r => r.RevieweeId == userId)
                .Select(r => MapReviewToDto(r))
                .ToList();
        }

        public List<ReviewDto> GetReviewsByUser(string userId)
        {
            return _db.Reviews
                .AsNoTracking()
                .Where(r => r.ReviewerId == userId)
                .Select(r => MapReviewToDto(r))
                .ToList();
        }

        public ReviewDto AddReview(UserSpaceReview review)
        {
            _db.Reviews.Add(review);
            _db.SaveChanges();
            return MapReviewToDto(review);
        }

        public bool DeleteReview(string reviewId)
        {
            var review = _db.Reviews.Find(reviewId);
            if (review is null) return false;
            _db.Reviews.Remove(review);
            _db.SaveChanges();
            return true;
        }

        public List<AuctionItemDto> GetAddedItemsByUser(string userId)
        {
            return _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.Owner == userId)
                .Select(a => MapAuctionItemToDto(a))
                .ToList();
        }

        public List<AuctionItemDto> GetWonItemsByUser(string userId)
        {
            return _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.Winner == userId)
                .Select(a => MapAuctionItemToDto(a))
                .ToList();
        }

        private ProfileDto BuildProfileDto(User user)
        {
            var reviewsReceived = _db.Reviews
                .AsNoTracking()
                .Where(r => r.RevieweeId == user.id)
                .ToList();

            var addedItems = _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.Owner == user.id)
                .ToList();

            var biddedItems = _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.Winner == user.id)
                .ToList();

            double? avgRating = reviewsReceived.Count > 0
                ? Math.Round(reviewsReceived.Average(r => (double)r.Score), 2)
                : null;

            return new ProfileDto
            {
                Id = user.id,
                UserName = user.userName,
                Name = user.name,
                Email = user.email,
                Role = user.roleEnum?.ToString() ?? string.Empty,
                AverageRating = avgRating,
                TotalReviewsReceived = reviewsReceived.Count,
                ReviewsReceived = reviewsReceived.Select(r => MapReviewToDto(r)).ToList(),
                AddedItems = addedItems.Select(a => MapAuctionItemToDto(a)).ToList(),
                BiddedItems = biddedItems.Select(a => MapAuctionItemToDto(a)).ToList()
            };
        }

        private static ReviewDto MapReviewToDto(UserSpaceReview r) => new ReviewDto
        {
            Id = r.Id,
            ReviewerId = r.ReviewerId,
            RevieweeId = r.RevieweeId,
            Score = r.Score,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        };

        private static AuctionItemDto MapAuctionItemToDto(AuctionItem a) => new AuctionItemDto
        {
            ID = a.ID,
            Name = a.Name,
            StartPrice = a.StartPrice,
            CurrentPrice = a.CurrentPrice,
            Category = a.Category ?? string.Empty,
            Status = a.Status.ToString(),
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            Owner = a.Owner ?? string.Empty
        };
    }
}
