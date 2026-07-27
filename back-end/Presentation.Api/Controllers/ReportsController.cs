// Controllers/ReportsController.cs
using Microsoft.AspNetCore.Mvc;
using Pos.Infrastructure.Interfaces;
using Pos.Infrastructure.Services;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportsService _reportsService;

    public ReportsController(IReportsService reportsService) => _reportsService = reportsService;

    [HttpGet("attendance")]
    public async Task<IActionResult> GetAttendanceReport([FromQuery] Guid branchId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        => Ok(await _reportsService.GetAttendanceReportAsync(branchId, startDate, endDate));

    [HttpGet("double-shift-audit")]
    public async Task<IActionResult> GetDoubleShiftAudit([FromQuery] Guid branchId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        => Ok(await _reportsService.GetDoubleShiftAuditReportAsync(branchId, startDate, endDate));

    [HttpGet("leave-summary")]
    public async Task<IActionResult> GetLeaveSummary([FromQuery] Guid branchId, [FromQuery] int year)
        => Ok(await _reportsService.GetLeaveSummaryReportAsync(branchId, year));

    [HttpGet("holiday-pay")]
    public async Task<IActionResult> GetHolidayPay([FromQuery] Guid branchId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        => Ok(await _reportsService.GetHolidayPayReportAsync(branchId, startDate, endDate));
}