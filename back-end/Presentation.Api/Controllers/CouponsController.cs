// Controllers/CouponsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiKey]
public class CouponsController : ControllerBase
{
    private readonly IRepository<Coupon> _couponsRepo;

    public CouponsController(IRepository<Coupon> couponsRepo)
    {
        _couponsRepo = couponsRepo;
    }

    // 1. GET /api/coupons - Retrieves all coupons mapped to client schema
    [HttpGet]
    public async Task<IActionResult> GetCoupons(CancellationToken cancellationToken)
    {
        var list = await _couponsRepo.GetAll().AsNoTracking().ToListAsync(cancellationToken);
        var result = list.Select(c => new
        {
            id = c.Code,
            code = c.Code,
            description = c.Description,
            discountType = c.DiscountType.ToLowerInvariant(),
            discountValue = c.DiscountValue,
            maxDiscountAmount = c.MaxDiscountAmount,
            minOrderAmount = c.MinOrderAmount,
            startDate = c.StartDate.ToString("yyyy-MM-dd"),
            endDate = c.EndDate.ToString("yyyy-MM-dd"),
            applicableProductIds = string.IsNullOrEmpty(c.ApplicableProductIdsJson)
                ? new List<string>()
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(c.ApplicableProductIdsJson),
            usageLimit = c.UsageLimit,
            usedCount = c.UsedCount,
            isActive = c.IsActive
        }).ToList();

        return Ok(result);
    }

    // 2. GET /api/coupons/code/{code} - Looks up a coupon by its code
    [HttpGet("code/{code}")]
    public async Task<IActionResult> GetCouponByCode(string code, CancellationToken cancellationToken)
    {
        var c = await _couponsRepo.GetAll().AsNoTracking().FirstOrDefaultAsync(x => x.Code == code, cancellationToken);
        if (c == null)
        {
            return NotFound(new { message = "Coupon not found." });
        }

        var result = new
        {
            id = c.Code,
            code = c.Code,
            description = c.Description,
            discountType = c.DiscountType.ToLowerInvariant(),
            discountValue = c.DiscountValue,
            maxDiscountAmount = c.MaxDiscountAmount,
            minOrderAmount = c.MinOrderAmount,
            startDate = c.StartDate.ToString("yyyy-MM-dd"),
            endDate = c.EndDate.ToString("yyyy-MM-dd"),
            applicableProductIds = string.IsNullOrEmpty(c.ApplicableProductIdsJson)
                ? new List<string>()
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(c.ApplicableProductIdsJson),
            usageLimit = c.UsageLimit,
            usedCount = c.UsedCount,
            isActive = c.IsActive
        };

        return Ok(result);
    }

    // 3. PUT /api/coupons/{code} - Updates coupon parameters
    [HttpPut("{code}")]
    public async Task<IActionResult> UpdateCoupon(string code, [FromBody] System.Text.Json.JsonElement updates, CancellationToken cancellationToken)
    {
        var coupon = await _couponsRepo.GetAll().FirstOrDefaultAsync(c => c.Code == code, cancellationToken);
        if (coupon == null)
        {
            return NotFound(new { message = "Coupon not found." });
        }

        if (updates.TryGetProperty("description", out var descProp))
            coupon.Description = descProp.GetString() ?? "";

        if (updates.TryGetProperty("discountType", out var typeProp))
            coupon.DiscountType = typeProp.GetString() ?? "Fixed";

        if (updates.TryGetProperty("discountValue", out var valProp))
            coupon.DiscountValue = valProp.GetDecimal();

        if (updates.TryGetProperty("maxDiscountAmount", out var maxProp))
            coupon.MaxDiscountAmount = maxProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : maxProp.GetDecimal();

        if (updates.TryGetProperty("minOrderAmount", out var minProp))
            coupon.MinOrderAmount = minProp.GetDecimal();

        if (updates.TryGetProperty("isActive", out var activeProp))
            coupon.IsActive = activeProp.GetBoolean();

        if (updates.TryGetProperty("usedCount", out var usedProp))
            coupon.UsedCount = usedProp.GetInt32();

        if (updates.TryGetProperty("usageLimit", out var limitProp))
            coupon.UsageLimit = limitProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : limitProp.GetInt32();

        coupon.UpdatedAt = DateTime.UtcNow;
        await _couponsRepo.UpdateAsync(coupon);

        return Ok(new { message = "Coupon updated successfully." });
    }

    // 4. POST /api/coupons/validate - Validates coupon rules and calculates discount amounts
    public record ValidateCouponRequest(string Code, decimal Subtotal, List<string> CartProductIds);

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request, CancellationToken cancellationToken)
    {
        var coupon = await _couponsRepo.GetAll().AsNoTracking().FirstOrDefaultAsync(c => c.Code == request.Code, cancellationToken);
        if (coupon == null)
        {
            return Ok(new
            {
                isValid = false,
                calculatedDiscount = 0m,
                message = "Invalid coupon code."
            });
        }

        var mappedCoupon = new
        {
            id = coupon.Code,
            code = coupon.Code,
            description = coupon.Description,
            discountType = coupon.DiscountType.ToLowerInvariant(),
            discountValue = coupon.DiscountValue,
            maxDiscountAmount = coupon.MaxDiscountAmount,
            minOrderAmount = coupon.MinOrderAmount,
            startDate = coupon.StartDate.ToString("yyyy-MM-dd"),
            endDate = coupon.EndDate.ToString("yyyy-MM-dd"),
            applicableProductIds = string.IsNullOrEmpty(coupon.ApplicableProductIdsJson)
                ? new List<string>()
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(coupon.ApplicableProductIdsJson),
            usageLimit = coupon.UsageLimit,
            usedCount = coupon.UsedCount,
            isActive = coupon.IsActive
        };

        if (!coupon.IsActive)
        {
            return Ok(new
            {
                isValid = false,
                coupon = mappedCoupon,
                calculatedDiscount = 0m,
                message = "Coupon is expired or inactive."
            });
        }

        var today = DateTime.UtcNow.Date;
        if (today < coupon.StartDate.Date || today > coupon.EndDate.Date)
        {
            return Ok(new
            {
                isValid = false,
                coupon = mappedCoupon,
                calculatedDiscount = 0m,
                message = "Coupon is not active today."
            });
        }

        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
        {
            return Ok(new
            {
                isValid = false,
                coupon = mappedCoupon,
                calculatedDiscount = 0m,
                message = "Coupon usage limit reached."
            });
        }

        if (request.Subtotal < coupon.MinOrderAmount)
        {
            return Ok(new
            {
                isValid = false,
                coupon = mappedCoupon,
                calculatedDiscount = 0m,
                message = $"Minimum order amount of {coupon.MinOrderAmount:F2} บาท required."
            });
        }

        bool isApplicable = true;
        if (!string.IsNullOrEmpty(coupon.ApplicableProductIdsJson))
        {
            var applicableIds = System.Text.Json.JsonSerializer.Deserialize<List<string>>(coupon.ApplicableProductIdsJson);
            if (applicableIds != null && applicableIds.Any())
            {
                isApplicable = request.CartProductIds.Any(pid => applicableIds.Contains(pid));
            }
        }

        if (!isApplicable)
        {
            return Ok(new
            {
                isValid = false,
                coupon = mappedCoupon,
                calculatedDiscount = 0m,
                message = "No applicable products in cart."
            });
        }

        decimal discount = 0m;
        if (coupon.DiscountType.Equals("percentage", StringComparison.OrdinalIgnoreCase))
        {
            discount = request.Subtotal * (coupon.DiscountValue / 100m);
            if (coupon.MaxDiscountAmount.HasValue)
            {
                discount = Math.Min(discount, coupon.MaxDiscountAmount.Value);
            }
        }
        else
        {
            discount = coupon.DiscountValue;
            discount = Math.Min(discount, request.Subtotal);
        }

        return Ok(new
        {
            isValid = true,
            coupon = mappedCoupon,
            calculatedDiscount = discount,
            message = "Coupon applied successfully."
        });
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