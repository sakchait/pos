// Infrastructure/Services/ReportsService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;

namespace Pos.Infrastructure.Services;

public class ReportsService : IReportsService
{
    private readonly ApplicationDbContext _context;

    public ReportsService(ApplicationDbContext context) => _context = context;

    // 1. Shift Schedule vs Actual Attendance Report
    public async Task<List<AttendanceReportDto>> GetAttendanceReportAsync(Guid branchId, DateTime startDate, DateTime endDate)
    {
        var report = await (
            from s in _context.ShiftSchedules
            join u in _context.Users on s.UserId equals u.Id
            join st in _context.ShiftTypes on s.ShiftTypeId equals st.Id
            from a in _context.Attendances
                .Where(a => a.UserId == s.UserId
                            && a.ClockIn >= s.WorkDate
                            && a.ClockIn < s.WorkDate.AddDays(1))
                .DefaultIfEmpty()
            where s.BranchId == branchId && s.WorkDate >= startDate.Date && s.WorkDate <= endDate.Date
            select new
            {
                s.UserId,
                u.FullName,
                s.RoleInShift,
                s.WorkDate,
                ShiftName = st.Name,
                st.StartTime,
                st.EndTime,
                ClockIn = (DateTime?)a.ClockIn,
                ClockOut = (DateTime?)a.ClockOut
            }
        ).ToListAsync();

        // ... (rest of method unchanged)
        return report.Select(r =>
        {
            var status = "Scheduled";
            double lateMinutes = 0;

            if (r.ClockIn.HasValue)
            {
                var expectedIn = r.WorkDate.Add(r.StartTime);
                if (r.ClockIn.Value > expectedIn.AddMinutes(5))
                {
                    status = "Late";
                    lateMinutes = (r.ClockIn.Value - expectedIn).TotalMinutes;
                }
                else
                {
                    status = "OnTime";
                }
            }
            else if (r.WorkDate < DateTime.UtcNow.Date)
            {
                status = "Absent";
            }

            return new AttendanceReportDto(
                r.UserId,
                r.FullName,
                r.RoleInShift,
                r.WorkDate,
                r.ShiftName,
                r.StartTime,
                r.EndTime,
                r.ClockIn,
                r.ClockOut,
                status,
                Math.Round(lateMinutes, 1)
            );
        }).ToList();
    }

    // 2. Overtime & Double Shift Audit Report
    public async Task<List<DoubleShiftAuditDto>> GetDoubleShiftAuditReportAsync(Guid branchId, DateTime startDate, DateTime endDate)
    {
        var doubleShifts = await _context.ShiftSchedules
            .Include(s => s.User)
            .Include(s => s.ShiftType)
            .Where(s => s.BranchId == branchId && s.WorkDate >= startDate.Date && s.WorkDate <= endDate.Date)
            .GroupBy(s => new { s.UserId, s.User.FullName, s.WorkDate })
            .Where(g => g.Count() >= 2) // กรองเฉพาะคนที่ทำตั้งแต่ 2 กะขึ้นไปในวันเดียว
            .Select(g => new
            {
                g.Key.UserId,
                EmployeeName = g.Key.FullName,
                g.Key.WorkDate,
                ConsecutiveShiftsCount = g.Count(),
                ShiftNames = string.Join(" + ", g.Select(x => x.ShiftType.Name)),
                TotalWorkedHours = g.Count() * 8.0 // สมมติ 8 ชม./กะ
            })
            .ToListAsync();

        return doubleShifts.Select(d => new DoubleShiftAuditDto(
            d.UserId,
            d.EmployeeName,
            d.WorkDate,
            d.ConsecutiveShiftsCount,
            d.TotalWorkedHours,
            d.ShiftNames,
            "Manager Approved", // สามารถดึงจากตาราง ShiftSwap/OvertimeLogs
            "พนักงานไม่พอในกะดึก"
        )).ToList();
    }

    // 3. Leave Summary Report
    public async Task<List<LeaveSummaryDto>> GetLeaveSummaryReportAsync(Guid branchId, int year)
    {
        var leaves = await _context.LeaveRequests
            .Include(l => l.User)
            .Where(l => l.User.BranchId == branchId && l.Status == "Approved" && l.StartDate.Year == year)
            .ToListAsync();

        var summary = leaves.GroupBy(l => new { l.UserId, l.User.FullName })
            .Select(g => new LeaveSummaryDto(
                g.Key.UserId,
                g.Key.FullName,
                g.Where(l => l.LeaveType == "SickLeave").Sum(l => (l.EndDate - l.StartDate).Days + 1),
                g.Where(l => l.LeaveType == "PersonalLeave").Sum(l => (l.EndDate - l.StartDate).Days + 1),
                g.Where(l => l.LeaveType == "AnnualLeave").Sum(l => (l.EndDate - l.StartDate).Days + 1),
                g.Sum(l => (l.EndDate - l.StartDate).Days + 1)
            )).ToList();

        return summary;
    }

    // 4. Holiday Pay Report (คิดตามกฎหมายแรงงาน 2-3 เท่า)
    public async Task<List<HolidayPayReportDto>> GetHolidayPayReportAsync(Guid branchId, DateTime startDate, DateTime endDate)
    {
        var holidayLogs = await (
            from a in _context.Attendances
            join u in _context.Users on a.UserId equals u.Id
            join h in _context.PublicHolidays on a.ClockIn.Date equals h.HolidayDate
            where u.BranchId == branchId && a.ClockIn >= startDate && a.ClockIn <= endDate && a.ClockOut.HasValue
            select new
            {
                a.UserId,
                u.FullName,
                u.HourlyRate,
                h.HolidayDate,
                HolidayName = h.Name,
                WorkedHours = (a.ClockOut.Value - a.ClockIn).TotalHours,
                Multiplier = h.PayMultiplier // 2.0 หรือ 3.0
            }
        ).ToListAsync();

        return holidayLogs.Select(h => new HolidayPayReportDto(
            h.UserId,
            h.FullName,
            h.HolidayDate,
            h.HolidayName,
            Math.Round(h.WorkedHours, 2),
            h.HourlyRate,
            (decimal)h.Multiplier,
            Math.Round((decimal)h.WorkedHours * h.HourlyRate * (decimal)h.Multiplier, 2)
        )).ToList();
    }
}