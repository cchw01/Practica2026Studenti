using Backend.Models;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateAuctionItemDto : IValidatableObject
    {
        [Required(ErrorMessage = "Numele itemului este obligatoriu.")]
        [StringLength(
            100,
            ErrorMessage = "Numele poate avea maximum 100 de caractere.")]
        public string Name { get; set; } = string.Empty;

        [Range(
            0.01,
            double.MaxValue,
            ErrorMessage = "Prețul de pornire trebuie să fie mai mare decât 0.")]
        public decimal StartPrice { get; set; }

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "CategoryId trebuie să fie mai mare decât 0.")]
        public int CategoryId { get; set; }

        [StringLength(
            1000,
            ErrorMessage = "Descrierea poate avea maximum 1000 de caractere.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Locația este obligatorie.")]
        [StringLength(
            100,
            ErrorMessage = "Locația poate avea maximum 100 de caractere.")]
        public string Location { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public IEnumerable<ValidationResult> Validate(
            ValidationContext validationContext)
        {
            if (EndDate <= StartDate)
            {
                yield return new ValidationResult(
                    "Data de final trebuie să fie după data de început.",
                    new[] { nameof(EndDate) });
            }
        }
    }

    public class UpdateAuctionItemDto : IValidatableObject
    {
        [Required(ErrorMessage = "Numele itemului este obligatoriu.")]
        [StringLength(
            100,
            ErrorMessage = "Numele poate avea maximum 100 de caractere.")]
        public string Name { get; set; } = string.Empty;

        [Range(
            0.01,
            double.MaxValue,
            ErrorMessage = "Prețul de pornire trebuie să fie mai mare decât 0.")]
        public decimal StartPrice { get; set; }

        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "CategoryId trebuie să fie mai mare decât 0.")]
        public int CategoryId { get; set; }

        [StringLength(
            1000,
            ErrorMessage = "Descrierea poate avea maximum 1000 de caractere.")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Locația este obligatorie.")]
        [StringLength(
            100,
            ErrorMessage = "Locația poate avea maximum 100 de caractere.")]
        public string Location { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public IEnumerable<ValidationResult> Validate(
            ValidationContext validationContext)
        {
            if (EndDate <= StartDate)
            {
                yield return new ValidationResult(
                    "Data de final trebuie să fie după data de început.",
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
    }
}