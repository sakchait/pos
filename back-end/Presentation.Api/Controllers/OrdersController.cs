// Controllers/SyncController.cs
using Microsoft.AspNetCore.Mvc;
using Pos.Application.DTOs;
using Pos.Infrastructure.Interfaces;

namespace Pos.Api.Controllers;

[ApiController]
public class OrdersController : ControllerBase
{
    private readonly ISyncService _syncService;

    public OrdersController(ISyncService syncService)
    {
        _syncService = syncService;
    }

    /// <summary>
    /// รับ Batch Orders จาก PWA Offline Storage มาทำการ Sync ลง SQL Server
    /// </summary>
    [HttpPost("/api/external/sync/orders")]
    public async Task<IActionResult> SyncOrders(
        [FromBody] List<CreateOrderDto> offlineOrders,
        CancellationToken cancellationToken)
    {
        if (offlineOrders == null || !offlineOrders.Any())
        {
            return BadRequest(new { message = "No orders provided for synchronization." });
        }

        var result = await _syncService.ProcessOfflineOrdersAsync(offlineOrders, cancellationToken);

        if (result.Errors.Any() && !result.SyncedOrderIds.Any())
        {
            return StatusCode(500, new { message = "Sync failed", errors = result.Errors });
        }

        return Ok(result);
    }
}