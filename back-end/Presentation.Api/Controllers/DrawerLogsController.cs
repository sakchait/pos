using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
public class DrawerLogsController : ControllerBase
{
    private readonly IRepository<DrawerOpenLog> _drawerRepo;
    private readonly IRepository<CashierShift> _shiftRepo;
    private readonly IRepository<User> _usersRepo;

    public DrawerLogsController(
        IRepository<DrawerOpenLog> drawerRepo,
        IRepository<CashierShift> shiftRepo,
        IRepository<User> usersRepo)
    {
        _drawerRepo = drawerRepo;
        _shiftRepo = shiftRepo;
        _usersRepo = usersRepo;
    }

    // 1. GET /api/drawer-logs - Fetches all drawer opening trigger logs
    [HttpGet("/api/drawer-logs")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDrawerLogs(CancellationToken cancellationToken)
    {
        var list = await _drawerRepo.GetAll()
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // Fetch Cashier and Manager FullNames
        var userIds = list.Select(l => l.CashierId)
            .Union(list.Where(l => l.ApprovedBy.HasValue).Select(l => l.ApprovedBy!.Value))
            .Distinct()
            .ToList();

        var users = await _usersRepo.GetAll()
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName, cancellationToken);

        var result = list.Select(l => new
        {
            id = l.Id.ToString(),
            cashierId = l.CashierId.ToString(),
            cashierName = users.TryGetValue(l.CashierId, out var cashierName) ? cashierName : "Unknown Cashier",
            timestamp = l.OpenedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            reason = l.Reason,
            managerApprovedBy = l.ApprovedBy?.ToString()
        }).ToList();

        return Ok(result);
    }

    // 2. POST /api/drawer-logs - Logs a new drawer opening event
    public class CreateDrawerLogRequest
    {
        public string Id { get; set; } = string.Empty;
        public string CashierId { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? ManagerApprovedBy { get; set; }
    }

    [HttpPost("/api/drawer-logs")]
    [AllowAnonymous]
    public async Task<IActionResult> AddDrawerLog([FromBody] CreateDrawerLogRequest request, CancellationToken cancellationToken)
    {
        var logId = Guid.TryParse(request.Id, out var parsedLogId) ? parsedLogId : Guid.NewGuid();

        // Prevent duplicates
        var existing = await _drawerRepo.GetAll()
            .FirstOrDefaultAsync(l => l.Id == logId, cancellationToken);
        if (existing != null)
        {
            return Ok(new { message = "Drawer log already exists.", id = existing.Id });
        }

        var cashierGuid = Guid.TryParse(request.CashierId, out var parsedCashierId) ? parsedCashierId : Guid.Empty;

        // Ensure active cashier shift exists
        var activeShift = await _shiftRepo.GetAll()
            .FirstOrDefaultAsync(s => s.CashierId == cashierGuid && s.Status == "Open", cancellationToken);

        if (activeShift == null)
        {
            activeShift = await _shiftRepo.GetAll()
                .FirstOrDefaultAsync(s => s.CashierId == cashierGuid, cancellationToken);
        }

        if (activeShift == null)
        {
            activeShift = new CashierShift
            {
                Id = Guid.NewGuid(),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"), // Head Office
                PosTerminalId = "term-1",
                CashierId = cashierGuid,
                OpenedAt = DateTime.UtcNow.AddHours(-1),
                OpeningCash = 100.00m,
                Status = "Open"
            };
            await _shiftRepo.AddAsync(activeShift);
        }

        var log = new DrawerOpenLog
        {
            Id = logId,
            BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"), // Head Office
            PosTerminalId = "term-1",
            ShiftId = activeShift.Id,
            CashierId = cashierGuid,
            ApprovedBy = Guid.TryParse(request.ManagerApprovedBy, out var parsedManagerId) ? parsedManagerId : null,
            Reason = request.Reason,
            OpenedAt = DateTime.TryParse(request.Timestamp, out var parsedTimestamp) ? parsedTimestamp : DateTime.UtcNow
        };

        await _drawerRepo.AddAsync(log);
        return Ok(new { message = "Drawer log added successfully.", id = log.Id });
    }
}
