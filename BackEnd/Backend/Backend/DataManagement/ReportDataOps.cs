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
                .ToArray();
        }

        public Report? GetReportById(int id)
        {
            return DbContext.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.AuctionItem)
                .Include(r => r.ForumPost)
                .FirstOrDefault(r => r.Id == id);
        }

        public void AddReport(Report report)
        {
            DbContext.Reports.Add(report);
            DbContext.SaveChanges();
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
            return DbContext.Reports
                .Include(r => r.Reporter)
                .Include(r => r.ReportedUser)
                .Include(r => r.AuctionItem)
                .Where(r => r.Status == status)
                .ToArray();
        }
    }
}
