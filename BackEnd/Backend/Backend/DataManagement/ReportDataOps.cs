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


        private IQueryable<Report> GetReportsWithDetails()
        {
            return DbContext.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.ReportedAuctionItem)
                    .ThenInclude(item => item!.Owner)
                .Include(r => r.ReportedForumPost)
                    .ThenInclude(post => post!.User);
        }

        public Report[] GetReports()
        {
            return GetReportsWithDetails()
                .ToArray();
        }

        public Report? GetReportById(int id)
        {
            return GetReportsWithDetails()
                .FirstOrDefault(r => r.Id == id);
        }

        public bool AddReport(Report report)
        {
            bool exists = DbContext.Reports.Any(r => 
                r.ReporterId == report.ReporterId && 
                r.TargetType == report.TargetType &&
                ((report.TargetType == ReportTargetType.User && r.ReportedUserId == report.ReportedUserId) ||
                 (report.TargetType == ReportTargetType.AuctionItem && r.ReportedAuctionItemId == report.ReportedAuctionItemId) ||
                 (report.TargetType == ReportTargetType.ForumPost && r.ReportedForumPostId == report.ReportedForumPostId))
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
                reportToUpdate.ReviewedAt = report.ReviewedAt;

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
            return GetReportsWithDetails()
                .Where(report => report.Status == status)
                .ToArray();
        }
    }
    
}
