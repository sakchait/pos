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
public class ShiftsController : ControllerBase
{
    private readonly IRepository<CashierShift> _shiftRepo;
    private readonly IRepository<DrawerDropTransaction> _dropRepo;

    public ShiftsController(
        IRepository<CashierShift> shiftRepo,
        IRepository<DrawerDropTransaction> dropRepo)
    {
        _shiftRepo = shiftRepo;
        _dropRepo = dropRepo;
    }

    // 1. GET /api/shifts/active - Gets the currently open shift for a cashier
    [HttpGet("/api/shifts/active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveShift([FromQuery] string cashierId, CancellationToken cancellationToken)
    {
        var cashierGuid = Guid.TryParse(cashierId, out var parsedId) ? parsedId : Guid.Empty;

        var shift = await _shiftRepo.GetAll()
            .Include(s => s.Cashier)
            .FirstOrDefaultAsync(s => s.CashierId == cashierGuid && s.Status == "Open", cancellationToken);

        if (shift == null)
        {
            return Ok(null); // Return null to indicate no open shift, matching React expectations
        }

        // Fetch drawer drops/transactions
        var transactions = await _dropRepo.GetAll()
            .Where(t => t.ShiftId == shift.Id)
            .ToListAsync(cancellationToken);

        var safeDropAmount = transactions.Where(t => t.Type == "SafeDrop").Sum(t => t.Amount);
        var paidInAmount = transactions.Where(t => t.Type == "PaidIn").Sum(t => t.Amount);
        var paidOutAmount = transactions.Where(t => t.Type == "PaidOut").Sum(t => t.Amount);

        var result = new
        {
            id = shift.Id.ToString(),
            cashierId = shift.CashierId.ToString(),
            cashierName = shift.Cashier?.FullName ?? "Unknown Cashier",
            terminalId = shift.PosTerminalId,
            openingTime = shift.OpenedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            closingTime = shift.ClosedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
            openingCash = (double)shift.OpeningCash,
            systemCashSales = (double)shift.TotalSystemCashSales,
            paidIn = (double)(shift.TotalCashPaidIn + paidInAmount),
            paidOut = (double)(shift.TotalCashPaidOut + paidOutAmount),
            safeDrop = (double)safeDropAmount,
            expectedCash = (double)shift.ExpectedCash,
            actualCashCounted = (double?)shift.ActualCashCounted,
            cashDifference = (double?)shift.CashDifference,
            status = shift.Status.ToUpperInvariant()
        };

        return Ok(result);
    }

    // 2. POST /api/shifts - Opens a new shift
    public class CreateShiftRequest
    {
        public string Id { get; set; } = string.Empty;
        public string CashierId { get; set; } = string.Empty;
        public string TerminalId { get; set; } = string.Empty;
        public string OpeningTime { get; set; } = string.Empty;
        public decimal OpeningCash { get; set; }
        public decimal SystemCashSales { get; set; }
        public decimal PaidIn { get; set; }
        public decimal PaidOut { get; set; }
        public decimal SafeDrop { get; set; }
        public string Status { get; set; } = "OPEN";
    }

    [HttpPost("/api/shifts")]
    [AllowAnonymous]
    public async Task<IActionResult> AddShift([FromBody] CreateShiftRequest request, CancellationToken cancellationToken)
    {
        var shiftGuid = Guid.TryParse(request.Id, out var parsedId) ? parsedId : Guid.NewGuid();

        // Prevent duplicates
        var existing = await _shiftRepo.GetAll().FirstOrDefaultAsync(s => s.Id == shiftGuid, cancellationToken);
        if (existing != null)
        {
            return Ok(new { message = "Shift already exists.", id = existing.Id });
        }

        var cashierGuid = Guid.TryParse(request.CashierId, out var parsedCashierId) ? parsedCashierId : Guid.Empty;

        // Auto-close any active shifts for this cashier
        var openShifts = await _shiftRepo.GetAll()
            .Where(s => s.CashierId == cashierGuid && s.Status == "Open")
            .ToListAsync(cancellationToken);
        foreach (var os in openShifts)
        {
            os.Status = "Closed";
            os.ClosedAt = DateTime.UtcNow;
            await _shiftRepo.UpdateAsync(os);
        }

        var shift = new CashierShift
        {
            Id = shiftGuid,
            BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"), // Head Office
            PosTerminalId = request.TerminalId,
            CashierId = cashierGuid,
            OpenedAt = DateTime.TryParse(request.OpeningTime, out var parsedOpen) ? parsedOpen : DateTime.UtcNow,
            OpeningCash = request.OpeningCash,
            TotalSystemCashSales = request.SystemCashSales,
            TotalCashPaidIn = request.PaidIn,
            TotalCashPaidOut = request.PaidOut,
            ExpectedCash = request.OpeningCash + request.SystemCashSales + request.PaidIn - request.PaidOut,
            Status = request.Status.Equals("CLOSED", StringComparison.OrdinalIgnoreCase) ? "Closed" : "Open"
        };

        await _shiftRepo.AddAsync(shift);
        return Ok(new { message = "Shift opened successfully.", id = shift.Id });
    }

    // 3. PUT /api/shifts/{id} - Closes or modifies an existing shift
    public class UpdateShiftRequest
    {
        public string? Status { get; set; }
        public string? ClosingTime { get; set; }
        public decimal? ActualCashCounted { get; set; }
        public decimal? CashDifference { get; set; }
        public decimal? SystemCashSales { get; set; }
        public decimal? ExpectedCash { get; set; }
        public string? CloseNotes { get; set; }
    }

    [HttpPut("/api/shifts/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateShift(string id, [FromBody] UpdateShiftRequest request, CancellationToken cancellationToken)
    {
        var shiftGuid = Guid.TryParse(id, out var parsedId) ? parsedId : Guid.Empty;

        var shift = await _shiftRepo.GetAll().FirstOrDefaultAsync(s => s.Id == shiftGuid, cancellationToken);
        if (shift == null)
        {
            return NotFound(new { message = $"Shift with ID '{id}' not found." });
        }

        if (request.Status != null)
        {
            shift.Status = request.Status.Equals("CLOSED", StringComparison.OrdinalIgnoreCase) ? "Closed" : "Open";
        }
        if (request.ClosingTime != null)
        {
            shift.ClosedAt = DateTime.TryParse(request.ClosingTime, out var parsedClosed) ? parsedClosed : DateTime.UtcNow;
        }
        else if (request.Status != null && request.Status.Equals("CLOSED", StringComparison.OrdinalIgnoreCase) && shift.ClosedAt == null)
        {
            shift.ClosedAt = DateTime.UtcNow;
        }

        if (request.ActualCashCounted.HasValue)
        {
            shift.ActualCashCounted = request.ActualCashCounted.Value;
        }
        if (request.CashDifference.HasValue)
        {
            shift.CashDifference = request.CashDifference.Value;
        }
        if (request.SystemCashSales.HasValue)
        {
            shift.TotalSystemCashSales = request.SystemCashSales.Value;
        }
        if (request.ExpectedCash.HasValue)
        {
            shift.ExpectedCash = request.ExpectedCash.Value;
        }
        if (request.CloseNotes != null)
        {
            shift.CloseNotes = request.CloseNotes;
        }

        // Recompute ExpectedCash and CashDifference
        shift.ExpectedCash = shift.OpeningCash + shift.TotalSystemCashSales + shift.TotalCashPaidIn - shift.TotalCashPaidOut;
        if (shift.ActualCashCounted.HasValue)
        {
            shift.CashDifference = shift.ActualCashCounted.Value - shift.ExpectedCash;
        }

        await _shiftRepo.UpdateAsync(shift);
        return Ok(new { message = "Shift updated successfully.", id = shift.Id });
    }
}
