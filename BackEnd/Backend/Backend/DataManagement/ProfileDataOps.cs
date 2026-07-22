using Backend.DTOs;
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

        public User? GetRawUserById(int userId)
        {
            return _db.Users.Find(userId);
        }

        public void SaveChanges()
        {
            _db.SaveChanges();
        }

        public ProfileDto? GetProfileById(int userId)
        {
            var user = _db.Users
                .Include(u => u.WishList)
                .FirstOrDefault(u => u.ID == userId);
            if (user is null) return null;
            return BuildProfileDto(user);
        }

        public ProfileDto? GetProfileByUserName(string userName)
        {
            var user = _db.Users
                .Include(u => u.WishList)
                .FirstOrDefault(u => u.UserName == userName);
            if (user is null) return null;
            return BuildProfileDto(user);
        }

        public List<ProfileDto> GetAllProfiles()
        {
            return _db.Users
                .AsNoTracking()
                .Select(u => new ProfileDto
                {
                    Id = u.ID.ToString(),
                    UserName = u.UserName,
                    Name = u.Name,
                    Email = u.Email
                })
                .ToList();
        }

        public ProfileDto? UpdateProfile(int userId, UpdateProfileDto request)
        {
            var user = _db.Users.Find(userId);
            if (user is null) return null;

            if (!string.IsNullOrWhiteSpace(request.Name))
                user.Name = request.Name;

            if (!string.IsNullOrWhiteSpace(request.Email))
                user.Email = request.Email;

            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
                user.PhoneNumber = request.PhoneNumber;

            _db.SaveChanges();
            return BuildProfileDto(user);
        }

        public List<ReviewDto> GetReviewsForUser(int userId)
        {
            return _db.Reviews
                .AsNoTracking()
                .Include(r => r.Reviewer)
                .Where(r => r.ReviewedUserId == userId)
                .ToList()
                .Select(r => MapReviewToDto(r))
                .ToList();
        }

        public List<ReviewDto> GetReviewsByUser(int userId)
        {
            return _db.Reviews
                .AsNoTracking()
                .Include(r => r.Reviewer)
                .Where(r => r.ReviewerId == userId)
                .ToList()
                .Select(r => MapReviewToDto(r))
                .ToList();
        }

        public ReviewDto AddReview(Review review)
        {
            _db.Reviews.Add(review);
            _db.SaveChanges();
            return MapReviewToDto(review);
        }

        public bool DeleteReview(int reviewId)
        {
            var review = _db.Reviews.Find(reviewId);
            if (review is null) return false;
            _db.Reviews.Remove(review);
            _db.SaveChanges();
            return true;
        }

        public List<AuctionItemSummaryDto> GetAddedItemsByUser(int userId)
        {
            return _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.OwnerId == userId)
                .Select(a => MapAuctionItemToDto(a))
                .ToList();
        }

        public List<AuctionItemSummaryDto> GetWonItemsByUser(int userId)
        {
            return _db.AuctionItems
                .AsNoTracking()
                .Where(a => a.WinnerId == userId)
                .Select(a => MapAuctionItemToDto(a))
                .ToList();
        }

        private ProfileDto BuildProfileDto(User user)
        {
            var reviewsReceived = _db.Reviews
                .AsNoTracking()
                .Include(r => r.Reviewer)
                .Where(r => r.ReviewedUserId == user.ID)
                .ToList();

            var addedItems = _db.AuctionItems
                .AsNoTracking()
                .Include(a => a.Category)
                .Where(a => a.OwnerId == user.ID)
                .ToList();

            var biddedItems = _db.AuctionItems
                .AsNoTracking()
                .Include(a => a.Category)
                .Where(a => a.WinnerId == user.ID)
                .ToList();

            var wishItems = user.WishList ?? new List<AuctionItem>();

            double? avgRating = reviewsReceived.Count > 0
                ? Math.Round(reviewsReceived.Average(r => (double)r.Rating), 2)
                : null;

            return new ProfileDto
            {
                Id = user.ID.ToString(),
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Role = user.Role.ToString(),
                AverageRating = avgRating,
                TotalReviewsReceived = reviewsReceived.Count,
                PictureName = _db.ProfilePictures
                                .Where(x => x.Id == user.ProfilePictureId)
                                .Select(x => x.PictureBase64)
                                .FirstOrDefault(),
                ReviewsReceived = reviewsReceived.Select(r => MapReviewToDto(r)).ToList(),
                AddedItems = addedItems.Select(a => MapAuctionItemToDto(a)).ToList(),
                BiddedItems = biddedItems.Select(a => MapAuctionItemToDto(a)).ToList(),
                WishList = wishItems.Select(a => MapAuctionItemToDto(a)).ToList()
            };
        }

        private ReviewDto MapReviewToDto(Review r)
        {
            return new ReviewDto
            {
                Id = r.Id.ToString(),
                ReviewerId = r.ReviewerId.ToString(),
                ReviewerName = r.Reviewer?.Name ?? r.Reviewer?.UserName ?? string.Empty,
                RevieweeId = r.ReviewedUserId.ToString(),
                Score = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.ReviewDate
            };
        }

        private static AuctionItemSummaryDto MapAuctionItemToDto(AuctionItem a) => new AuctionItemSummaryDto
        {
            ID = a.ID,
            Name = a.Name,
            StartPrice = a.StartPrice,
            CurrentPrice = a.CurrentPrice,
            Category = a.Category != null ? a.Category.name : string.Empty,
            Status = a.Status.ToString(),
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            OwnerName = a.OwnerId.ToString(),
            ImageUrl = a.ImageUrl ?? string.Empty
        };
    }
}
