// Controllers/CouponsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;

namespace Pos.Api.Controllers;

[ApiController]
[Route("external/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly IRepository<Coupon> _couponsRepo;

    public CouponsController(IRepository<Coupon> couponsRepo)
    {
        _couponsRepo = couponsRepo;
    }

    /// <summary>
    /// ดึงรายการคูปองที่มีการสร้าง แก้ไข หรือระงับการใช้งาน หลังจาก lastSyncedAt
    /// </summary>
    [HttpGet("sync")]
    public async Task<IActionResult> GetCouponsForSync([FromQuery] DateTime? lastSyncedAt, CancellationToken cancellationToken)
    {
        var query = _couponsRepo.GetAll().AsNoTracking();

        if (lastSyncedAt.HasValue)
        {
            // ดึงเฉพาะคูปองที่อัปเดตหลังจากวันที่ระบุ
            query = query.Where(c => c.UpdatedAt > lastSyncedAt.Value);
        }

        var updatedCoupons = await query.Select(c => new
        {
            c.Code,
            c.Description,
            c.DiscountType,
            c.DiscountValue,
            c.MaxDiscountAmount,
            c.MinOrderAmount,
            c.StartDate,
            c.EndDate,
            c.ApplicableProductIdsJson,
            c.UsageLimit,
            c.UsedCount,
            c.IsActive,
            c.UpdatedAt
        }).ToListAsync(cancellationToken);

        return Ok(new
        {
            serverTime = DateTime.UtcNow,
            coupons = updatedCoupons
        });
    }
}