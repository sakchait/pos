using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Entities;
using Pos.Application.Repositories;
using Presentation.Api.Authorization;

[ApiController]
[ApiKey]
[Route("api/external/[controller]")]
public class PerformanceController : ControllerBase
{
    private readonly IRepository<Order> _ordersRepo;

    public PerformanceController(IRepository<Order> ordersRepo) => _ordersRepo = ordersRepo;

    [HttpGet("top-sales")]
    public async Task<IActionResult> GetTopSalesEmployees([FromQuery] Guid branchId, [FromQuery] string period = "monthly")
    {
        var startDate = period switch
        {
            "daily" => DateTime.UtcNow.Date,
            "weekly" => DateTime.UtcNow.AddDays(-7),
            _ => new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)
        };

        var topEmployees = await _ordersRepo.GetAll()
            .Where(o => o.BranchId == branchId && o.CreatedAt >= startDate)
            .GroupBy(o => o.CashierId)
            .Select(g => new
            {
                CashierId = g.Key,
                TotalSales = g.Sum(o => o.GrandTotal),
                TotalOrders = g.Count(),
                AverageOrderValue = g.Average(o => o.GrandTotal)
            })
            .OrderByDescending(e => e.TotalSales)
            .Take(5)
            .ToListAsync();

        return Ok(topEmployees);
    }
}