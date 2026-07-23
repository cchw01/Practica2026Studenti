using Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateAuctionItemDto : IValidatableObject
    {
        [Required(ErrorMessage = "Item name is required.")]
        [StringLength(
            30,
            ErrorMessage = "Name can have a maximum of 30 characters.")]
        public string Name { get; set; } = string.Empty;

        [Range(
            0.01,
            double.MaxValue,
            ErrorMessage = "Starting price must be greater than 0.")]
        public decimal StartPrice { get; set; }

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "CategoryId must be greater than 0.")]
        public int CategoryId { get; set; }

        [StringLength(
            200,
            ErrorMessage = "Description can have a maximum of 200 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(
            50,
            ErrorMessage = "Location can have a maximum of 50 characters.")]
        public string Location { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public IEnumerable<ValidationResult> Validate(
            ValidationContext validationContext)
        {
            if (EndDate <= StartDate)
            {
                yield return new ValidationResult(
                    "End date must be after start date.",
                    new[] { nameof(EndDate) });
            }
        }
    }

    public class UpdateAuctionItemDto : IValidatableObject
    {
        [Required(ErrorMessage = "Item name is required.")]
        [StringLength(
            30,
            ErrorMessage = "Name can have a maximum of 30 characters.")]
        public string Name { get; set; } = string.Empty;

        [Range(
            0.01,
            double.MaxValue,
            ErrorMessage = "Starting price must be greater than 0.")]
        public decimal StartPrice { get; set; }

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "CategoryId must be greater than 0.")]
        public int CategoryId { get; set; }

        [StringLength(
            200,
            ErrorMessage = "Description can have a maximum of 200 characters.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Location is required.")]
        [StringLength(
            50,
            ErrorMessage = "Location can have a maximum of 50 characters.")]
        public string Location { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public IEnumerable<ValidationResult> Validate(
            ValidationContext validationContext)
        {
            if (EndDate <= StartDate)
            {
                yield return new ValidationResult(
                    "End date must be after start date.",
                    new[] { nameof(EndDate) });
            }
        }
    }

    public class AuctionItemResponseDto
    {
        public int ID { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal StartPrice { get; set; }

        public decimal CurrentPrice { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Location { get; set; } = string.Empty;

        public int OwnerId { get; set; }

        public string OwnerUserName { get; set; } = string.Empty;

        public int? WinnerId { get; set; }

        public string? WinnerUserName { get; set; }

        public AuctionItem.StatusEnum Status { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string? ImageUrl { get; set; }

        public bool HasBids { get; set; }
    }
}