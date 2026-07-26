// Infrastructure/Services/ReportsService.cs
using Pos.Application.DTOs;

namespace Pos.Infrastructure.Interfaces
{
    public interface IReportsService
    {
        Task<List<AttendanceReportDto>> GetAttendanceReportAsync(Guid branchId, DateTime startDate, DateTime endDate);
        Task<List<DoubleShiftAuditDto>> GetDoubleShiftAuditReportAsync(Guid branchId, DateTime startDate, DateTime endDate);
        Task<List<HolidayPayReportDto>> GetHolidayPayReportAsync(Guid branchId, DateTime startDate, DateTime endDate);
        Task<List<LeaveSummaryDto>> GetLeaveSummaryReportAsync(Guid branchId, int year);
    }
}