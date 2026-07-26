// Application/DTOs/ReportDtos.cs
namespace Pos.Application.DTOs;

// 1. Attendance Comparison DTO
public record AttendanceReportDto(
    Guid UserId,
    string EmployeeName,
    string Role,
    DateTime WorkDate,
    string ScheduledShift,
    TimeSpan ScheduledStartTime,
    TimeSpan ScheduledEndTime,
    DateTime? ActualClockIn,
    DateTime? ActualClockOut,
    string Status, // OnTime, Late, Absent, EarlyLeave
    double LateMinutes
);

// 2. Overtime & Double Shift Audit DTO
public record DoubleShiftAuditDto(
    Guid UserId,
    string EmployeeName,
    DateTime WorkDate,
    int ConsecutiveShiftsCount,
    double TotalWorkedHours,
    string ShiftNames,
    string ManagerApprovedBy,
    string Reason
);

// 3. Leave Summary DTO
public record LeaveSummaryDto(
    Guid UserId,
    string EmployeeName,
    int SickLeaveDays,
    int PersonalLeaveDays,
    int AnnualLeaveDays,
    int TotalLeaveDays
);

// 4. Holiday Pay DTO
public record HolidayPayReportDto(
    Guid UserId,
    string EmployeeName,
    DateTime HolidayDate,
    string HolidayName,
    double WorkedHours,
    decimal HourlyRate,
    decimal PayMultiplier, // 2.0 หรือ 3.0 เท่า
    decimal TotalHolidayPay
);