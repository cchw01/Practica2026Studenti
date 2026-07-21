using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.DataManagement
{
    public class ReportDataOps
    {
        private readonly ApplicationDbContext DbContext;

        public ReportDataOps(ApplicationDbContext context)
        {
            DbContext = context;
        }

        public Report[] GetReports()
        {
            return DbContext.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.AuctionItem)
                .Include(r => r.ForumPost)
                .Include(r => r.ReviewedByAdmin)
                .ToArray();
        }

        public Report? GetReportById(int id)
        {
            return DbContext.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.AuctionItem)
                .Include(r => r.ForumPost)
                .Include(r => r.ReviewedByAdmin)
                .FirstOrDefault(r => r.Id == id);
        }

        public bool AddReport(Report report)
        {
            bool exists = DbContext.Reports.Any(r => 
                r.ReporterId == report.ReporterId && 
                r.TargetType == report.TargetType &&
                ((report.TargetType == ReportTargetType.User && r.ReportedUserId == report.ReportedUserId) ||
                 (report.TargetType == ReportTargetType.AuctionItem && r.AuctionItemId == report.AuctionItemId) ||
                 (report.TargetType == ReportTargetType.ForumPost && r.ForumPostId == report.ForumPostId))
            );

            if (exists)
            {
                return false;
            }

            DbContext.Reports.Add(report);
            DbContext.SaveChanges();
            return true;
        }

        public bool UpdateReport(Report report)
        {
            var reportToUpdate = DbContext.Reports.FirstOrDefault(r => r.Id == report.Id);
            if (reportToUpdate != null)
            {
                reportToUpdate.Status = report.Status;
                reportToUpdate.ReviewedByAdminId = report.ReviewedByAdminId;
                reportToUpdate.ReviewedAt = report.ReviewedAt;
                reportToUpdate.AdminComment = report.AdminComment;

                DbContext.SaveChanges();
                return true;
            }
            return false;
        }

        public bool DeleteReport(int id)
        {
            var report = DbContext.Reports.FirstOrDefault(r => r.Id == id);

            if (report != null)
            {
                DbContext.Reports.Remove(report);
                DbContext.SaveChanges();
                return true;
            }

            return false;
        }
        
        public Report[] GetReportsByStatus(ReportStatus status)
        {
            return DbContext.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.AuctionItem)
                .Include(r => r.ForumPost)
                .Include(r => r.ReviewedByAdmin)
                .Where(r => r.Status == status)
                .ToArray();
        }
    }
}
