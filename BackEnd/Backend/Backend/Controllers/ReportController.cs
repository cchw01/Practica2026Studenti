using Backend.DataManagement;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ReportDataOps dataOps;

        public ReportController(ApplicationDbContext dbContext)
        {
            dataOps = new ReportDataOps(dbContext);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public ActionResult<IEnumerable<ReportResponseDto>> GetReports()
        {
            try
            {
                var reports = dataOps.GetReports();
                var dtos = reports.Select(MapToDTO);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("status/{status}")]
        [Authorize(Roles = "Admin")]
        public ActionResult<IEnumerable<ReportResponseDto>> GetReportsByStatus(ReportStatus status)
        {
            try
            {
                var reports = dataOps.GetReportsByStatus(status);
                var dtos = reports.Select(MapToDTO);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult<ReportResponseDto> GetReport(int id)
        {
            try
            {
                var report = dataOps.GetReportById(id);

                if (report == null)
                    return NotFound();

                return Ok(MapToDTO(report));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize]
        [HttpPost]
        public ActionResult<ReportResponseDto> AddReport(CreateReportDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;

                if (!int.TryParse(userIdClaim, out var reporterId))
                {
                    return Unauthorized();
                }

                var report = new Report
                {
                    ReporterId = reporterId,
                    TargetType = dto.TargetType ?? ReportTargetType.User,
                    Reason = dto.Reason ?? ReportReason.Other,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow,
                    Status = ReportStatus.Pending
                };

                switch (report.TargetType)
                {
                    case ReportTargetType.User:
                        report.ReportedUserId = dto.TargetId;
                        break;
                    case ReportTargetType.AuctionItem:
                        report.ReportedAuctionItemId = dto.TargetId;
                        break;
                    case ReportTargetType.ForumPost:
                        report.ReportedForumPostId = dto.TargetId;
                        break;
                    default:
                        return BadRequest("Tipul de target invalid.");
                }

                var success = dataOps.AddReport(report);
                if (!success)
                {
                    return BadRequest("Acest raport există deja.");
                }

                var created = dataOps.GetReportById(report.Id);
                return Ok(MapToDTO(created!));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult<ReportResponseDto> UpdateReportStatus(int id, UpdateReportStatusDto dto)
        {
            try
            {
                var existing = dataOps.GetReportById(id);
                if (existing == null)
                    return NotFound();

                if (dto.Status.HasValue)
                {
                    existing.Status = dto.Status.Value;
                    
                    if (dto.Status.Value == ReportStatus.ActionTaken || dto.Status.Value == ReportStatus.Dismissed)
                    {
                        existing.ReviewedAt = DateTime.UtcNow;
                    }
                }

                var success = dataOps.UpdateReport(existing);
                if (!success)
                {
                    return BadRequest("Actualizarea a eșuat.");
                }

                var updated = dataOps.GetReportById(id);
                return Ok(MapToDTO(updated!));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public ActionResult DeleteReport(int id)
        {
            try
            {
                var success = dataOps.DeleteReport(id);
                if (!success)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private static ReportResponseDto MapToDTO(Report report)
        {
            var dto = new ReportResponseDto
            {
                Id = report.Id,
                ReporterId = report.ReporterId,
                ReporterUserName = report.Reporter?.UserName ?? "",
                TargetType = report.TargetType,
                Reason = report.Reason,
                Description = report.Description,
                CreatedAt = report.CreatedAt,
                Status = report.Status,
                ReviewedAt = report.ReviewedAt
            };

            switch (report.TargetType)
            {
                case ReportTargetType.User:
                    dto.TargetId = report.ReportedUserId ?? 0;
                    dto.TargetDisplayName = report.ReportedUser?.UserName ?? "";
                    break;
                case ReportTargetType.AuctionItem:
                    dto.TargetId = report.ReportedAuctionItemId ?? 0;
                    dto.TargetDisplayName = report.ReportedAuctionItem?.Name ?? "";
                    dto.TargetOwnerId = report.ReportedAuctionItem?.OwnerId;
                    dto.TargetOwnerUserName = report.ReportedAuctionItem?.Owner?.UserName;
                    break;
                case ReportTargetType.ForumPost:
                    dto.TargetId = report.ReportedForumPostId ?? 0;
                    dto.TargetDisplayName = report.ReportedForumPost?.Title ?? "";
                    dto.TargetOwnerId = report.ReportedForumPost?.UserId;
                    dto.TargetOwnerUserName = report.ReportedForumPost?.User?.UserName;
                    break;
            }

            return dto;
        }
    }
}
