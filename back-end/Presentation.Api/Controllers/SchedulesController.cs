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
public class SchedulesController : ControllerBase
{
    private readonly IRepository<ShiftSchedule> _schedulesRepo;
    private readonly IRepository<ShiftSwapRequest> _swapsRepo;
    private readonly IRepository<User> _usersRepo;
    private readonly Infrastructure.Interfaces.IShiftSwapService _shiftSwapService;

    public SchedulesController(
        IRepository<ShiftSchedule> schedulesRepo,
        IRepository<ShiftSwapRequest> swapsRepo,
        IRepository<User> usersRepo,
        Infrastructure.Interfaces.IShiftSwapService shiftSwapService)
    {
        _schedulesRepo = schedulesRepo;
        _swapsRepo = swapsRepo;
        _usersRepo = usersRepo;
        _shiftSwapService = shiftSwapService;
    }

    // 1. GET /api/schedules - Gets employee work schedules mapped to frontend
    [HttpGet("/api/schedules")]
    public async Task<IActionResult> GetSchedules(CancellationToken cancellationToken)
    {
        var list = await _schedulesRepo.GetAll()
            .Include(s => s.User)
            .Include(s => s.ShiftType)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var result = list.Select(s => new
        {
            id = s.Id.ToString(),
            employeeId = s.UserId.ToString(),
            employeeName = s.User?.FullName ?? "Unknown",
            role = s.RoleInShift,
            date = s.WorkDate.ToString("yyyy-MM-dd"),
            shiftType = MapShiftTypeToFrontend(s.ShiftTypeId),
            status = s.Status.ToUpperInvariant()
        }).ToList();

        return Ok(result);
    }

    // 2. POST /api/schedules - Dispatches a new shift schedule
    public record AddScheduleRequest(
        string Id,
        string EmployeeId,
        string EmployeeName,
        string Role,
        string Date,
        string ShiftType,
        string Status
    );

    [HttpPost("/api/schedules")]
    public async Task<IActionResult> AddSchedule([FromBody] AddScheduleRequest request, CancellationToken cancellationToken)
    {
        var schedule = new ShiftSchedule
        {
            Id = Guid.TryParse(request.Id, out var parsedId) ? parsedId : Guid.NewGuid(),
            UserId = Guid.TryParse(request.EmployeeId, out var parsedEmpId) ? parsedEmpId : Guid.Empty,
            BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"), // Head Office
            ShiftTypeId = MapShiftTypeToBackend(request.ShiftType),
            WorkDate = DateTime.TryParse(request.Date, out var parsedDate) ? parsedDate : DateTime.UtcNow.Date,
            RoleInShift = request.Role,
            Status = request.Status == "SCHEDULED" ? "Scheduled" : "Completed"
        };

        await _schedulesRepo.AddAsync(schedule);
        return Ok(new { message = "Schedule added successfully.", id = schedule.Id });
    }

    // 3. PUT /api/schedules/{id} - Modifies a schedule
    [HttpPut("/api/schedules/{id}")]
    public async Task<IActionResult> UpdateSchedule(Guid id, [FromBody] System.Text.Json.JsonElement updates, CancellationToken cancellationToken)
    {
        var schedule = await _schedulesRepo.GetAll().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (schedule == null)
        {
            return NotFound(new { message = "Schedule not found." });
        }

        if (updates.TryGetProperty("status", out var statusProp))
        {
            var statusStr = statusProp.GetString()?.ToUpperInvariant();
            schedule.Status = statusStr switch
            {
                "SCHEDULED" => "Scheduled",
                "COMPLETED" => "Completed",
                "SWAP_PENDING" => "SwapPending",
                _ => schedule.Status
            };
        }

        if (updates.TryGetProperty("date", out var dateProp))
        {
            if (DateTime.TryParse(dateProp.GetString(), out var parsedDate))
            {
                schedule.WorkDate = parsedDate;
            }
        }

        if (updates.TryGetProperty("shiftType", out var typeProp))
        {
            schedule.ShiftTypeId = MapShiftTypeToBackend(typeProp.GetString() ?? "Morning");
        }

        await _schedulesRepo.UpdateAsync(schedule);
        return Ok(new { message = "Schedule updated successfully." });
    }

    // 4. GET /api/swaps - Gets shift swap request logs
    [HttpGet("/api/swaps")]
    public async Task<IActionResult> GetSwaps(CancellationToken cancellationToken)
    {
        var swaps = await _swapsRepo.GetAll()
            .Include(s => s.RequestorShift)
            .ThenInclude(rs => rs.User)
            .Include(s => s.RequestorShift.ShiftType)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var userIds = swaps.Select(s => s.TargetUserId)
            .Concat(swaps.Select(s => s.RequestorShift != null ? s.RequestorShift.UserId : Guid.Empty))
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var usersDict = await _usersRepo.GetAll()
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName, cancellationToken);

        var result = swaps.Select(s => new
        {
            id = s.Id.ToString(),
            requesterId = s.RequestorShift?.UserId.ToString() ?? "",
            requesterName = s.RequestorShift?.User?.FullName ?? "Unknown",
            recipientId = s.TargetUserId.ToString(),
            recipientName = usersDict.TryGetValue(s.TargetUserId, out var name) ? name : "Unknown",
            scheduleId = s.RequestorShiftId.ToString(),
            date = s.RequestorShift?.WorkDate.ToString("yyyy-MM-dd") ?? "",
            shiftType = s.RequestorShift != null ? MapShiftTypeToFrontend(s.RequestorShift.ShiftTypeId) : "Morning",
            status = MapSwapStatusToFrontend(s.Status),
            createdAt = s.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        }).ToList();

        return Ok(result);
    }

    // 5. POST /api/swaps - Initiates a shift swap request
    public record AddSwapRequest(
        string Id,
        string RequesterId,
        string RecipientId,
        string ScheduleId,
        string Date,
        string ShiftType,
        string Status,
        string CreatedAt
    );

    [HttpPost("/api/swaps")]
    public async Task<IActionResult> AddSwap([FromBody] AddSwapRequest request, CancellationToken cancellationToken)
    {
        var swap = new ShiftSwapRequest
        {
            Id = Guid.TryParse(request.Id, out var parsedId) ? parsedId : Guid.NewGuid(),
            RequestorShiftId = Guid.TryParse(request.ScheduleId, out var parsedSchId) ? parsedSchId : Guid.Empty,
            TargetUserId = Guid.TryParse(request.RecipientId, out var parsedRecId) ? parsedRecId : Guid.Empty,
            Reason = "Shift swap request from frontend",
            Status = MapSwapStatusToBackend(request.Status),
            CreatedAt = DateTime.TryParse(request.CreatedAt, out var parsedCreated) ? parsedCreated : DateTime.UtcNow
        };

        await _swapsRepo.AddAsync(swap);
        return Ok(new { message = "Swap request initiated successfully.", id = swap.Id });
    }

    // 6. PUT /api/swaps/{id} - Approves, rejects, or updates a shift swap
    [HttpPut("/api/swaps/{id}")]
    public async Task<IActionResult> UpdateSwap(Guid id, [FromBody] System.Text.Json.JsonElement updates, CancellationToken cancellationToken)
    {
        var swap = await _swapsRepo.GetAll()
            .Include(s => s.RequestorShift)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (swap == null)
        {
            return NotFound(new { message = "Swap request not found." });
        }

        if (updates.TryGetProperty("status", out var statusProp))
        {
            var statusStr = statusProp.GetString()?.ToUpperInvariant();
            if (statusStr == "APPROVED")
            {
                // Retrieve or default manager ID
                var managerId = Guid.Parse("33333333-3333-3333-3333-333333333334"); // Sarah Jenkins
                try
                {
                    var success = await _shiftSwapService.ApproveShiftSwapAsync(id, managerId);
                    if (!success)
                    {
                        return BadRequest(new { message = "Failed to approve shift swap request." });
                    }
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(new { message = ex.Message });
                }
            }
            else
            {
                swap.Status = MapSwapStatusToBackend(statusStr ?? "PENDING");
                await _swapsRepo.UpdateAsync(swap);
            }
        }

        return Ok(new { message = "Swap request updated successfully." });
    }

    private static string MapShiftTypeToFrontend(int shiftTypeId)
    {
        return shiftTypeId switch
        {
            1 => "Morning",
            2 => "Afternoon",
            3 => "Night",
            _ => "Morning"
        };
    }

    private static int MapShiftTypeToBackend(string shiftType)
    {
        return shiftType switch
        {
            "Morning" => 1,
            "Afternoon" => 2,
            "Night" => 3,
            _ => 1
        };
    }

    private static string MapSwapStatusToFrontend(string status)
    {
        return status switch
        {
            "PendingPeer" => "PENDING",
            "PendingManager" => "ACCEPTED",
            "Approved" => "APPROVED",
            "Rejected" => "REJECTED",
            _ => "PENDING"
        };
    }

    private static string MapSwapStatusToBackend(string status)
    {
        return status switch
        {
            "PENDING" => "PendingPeer",
            "ACCEPTED" => "PendingManager",
            "APPROVED" => "Approved",
            "REJECTED" => "Rejected",
            _ => "PendingPeer"
        };
    }
}
