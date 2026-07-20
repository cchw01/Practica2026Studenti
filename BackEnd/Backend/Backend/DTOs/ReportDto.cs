using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs
{
    public class CreateReportDto
    {
        [Required]
        public ReportTargetType? TargetType { get; set; }

        [Range(1, int.MaxValue,
            ErrorMessage = "TargetId trebuie să fie mai mare decât 0.")]
        public int TargetId { get; set; }

        [Required]
        public ReportReason? Reason { get; set; }

        [StringLength(500,
            ErrorMessage = "Descrierea poate avea maximum 500 de caractere.")]
        public string? Description { get; set; }
    }

    public class ReportResponseDto
    {
        public int Id { get; set; }

        public int ReporterId { get; set; }
        public string ReporterUserName { get; set; } = string.Empty;

        public ReportTargetType TargetType { get; set; }

        public int TargetId { get; set; }
        public string TargetDisplayName { get; set; } = string.Empty;

        public int? TargetOwnerId { get; set; }
        public string? TargetOwnerUserName { get; set; }

        public ReportReason Reason { get; set; }
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }

        public ReportStatus Status { get; set; }

        public DateTime? ReviewedAt { get; set; }
    }

    public class UpdateReportStatusDto
    {
        [Required]
        public ReportStatus? Status { get; set; }
    }
}