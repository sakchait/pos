using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
public class HrLogsController : ControllerBase
{
    private readonly IRepository<Attendance> _attendanceRepo;
    private readonly IRepository<LeaveRequest> _leaveRepo;
    private readonly IRepository<ShiftSchedule> _schedulesRepo;

    public HrLogsController(
        IRepository<Attendance> attendanceRepo,
        IRepository<LeaveRequest> leaveRepo,
        IRepository<ShiftSchedule> schedulesRepo)
    {
        _attendanceRepo = attendanceRepo;
        _leaveRepo = leaveRepo;
        _schedulesRepo = schedulesRepo;
    }

    // 1. GET /api/attendance - Gets local attendance records
    [HttpGet("/api/attendance")]
    public async Task<IActionResult> GetAttendance(CancellationToken cancellationToken)
    {
        var list = await _attendanceRepo.GetAll()
            .Include(a => a.User)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var userIds = list.Select(a => a.UserId).Distinct().ToList();

        var schedules = await _schedulesRepo.GetAll()
            .Include(s => s.ShiftType)
            .AsNoTracking()
            .Where(s => userIds.Contains(s.UserId))
            .ToListAsync(cancellationToken);

        var result = list.Select(a =>
        {
            var dateStr = a.ClockIn.ToString("yyyy-MM-dd");
            var sched = schedules.FirstOrDefault(s => s.UserId == a.UserId && s.WorkDate.Date == a.ClockIn.Date);

            var schedStart = sched?.ShiftType != null ? DateTime.Today.Add(sched.ShiftType.StartTime).ToString("HH:mm") : "09:00";
            var schedEnd = sched?.ShiftType != null ? DateTime.Today.Add(sched.ShiftType.EndTime).ToString("HH:mm") : "18:00";

            var clockInStr = a.ClockIn.ToString("HH:mm");
            var clockOutStr = a.ClockOut?.ToString("HH:mm") ?? "";

            var isLate = false;
            var lateMin = 0;
            if (sched?.ShiftType != null)
            {
                var expectedIn = a.ClockIn.Date.Add(sched.ShiftType.StartTime);
                if (a.ClockIn > expectedIn.AddMinutes(5)) // Late threshold 5 minutes (as per ReportsService pattern)
                {
                    isLate = true;
                    lateMin = (int)(a.ClockIn - expectedIn).TotalMinutes;
                }
            }

            return new
            {
                id = a.Id.ToString(),
                employeeId = a.UserId.ToString(),
                employeeName = a.User?.FullName ?? "Unknown",
                date = dateStr,
                scheduledStart = schedStart,
                scheduledEnd = schedEnd,
                actualClockIn = clockInStr,
                actualClockOut = clockOutStr,
                isLate = isLate,
                lateMinutes = lateMin
            };
        }).ToList();

        return Ok(result);
    }

    // 2. GET /api/leaves - Gets local leave audit logs
    [HttpGet("/api/leaves")]
    public async Task<IActionResult> GetLeaves(CancellationToken cancellationToken)
    {
        var list = await _leaveRepo.GetAll()
            .Include(l => l.User)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var result = list.Select(l => new
        {
            id = l.Id.ToString(),
            employeeId = l.UserId.ToString(),
            employeeName = l.User?.FullName ?? "Unknown",
            leaveType = MapLeaveTypeToFrontend(l.LeaveType),
            startDate = l.StartDate.ToString("yyyy-MM-dd"),
            endDate = l.EndDate.ToString("yyyy-MM-dd"),
            daysCount = (l.EndDate - l.StartDate).Days + 1,
            status = l.Status.ToUpperInvariant()
        }).ToList();

        return Ok(result);
    }

    private static string MapLeaveTypeToFrontend(string leaveType)
    {
        return leaveType switch
        {
            "SickLeave" => "Sick",
            "PersonalLeave" => "Personal",
            "AnnualLeave" => "Annual",
            _ => "Sick"
        };
    }
}
