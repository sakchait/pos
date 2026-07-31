using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Entities;
using Pos.Domain.Persistence;
using Presentation.Api.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/coupons/validate")]
public class CouponValidationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CouponValidationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> ValidateCoupon([FromBody] CouponValidationRequest request, CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { message = "Coupon code is required." });
        }

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code.ToLower() == request.Code.ToLower(), cancellationToken);

        if (coupon == null)
        {
            return Ok(new CouponValidationResponse
            {
                IsValid = false,
                DiscountAmount = 0,
                Message = "Invalid coupon code."
            });
        }

        if (!coupon.IsActive)
        {
            return Ok(new CouponValidationResponse
            {
                IsValid = false,
                DiscountAmount = 0,
                Message = "This coupon is no longer active."
            });
        }

        var now = DateTime.UtcNow;
        if (now < coupon.StartDate || now > coupon.EndDate)
        {
            return Ok(new CouponValidationResponse
            {
                IsValid = false,
                DiscountAmount = 0,
                Message = "This coupon has expired or is not yet valid."
            });
        }

        if (coupon.UsedCount >= coupon.UsageLimit)
        {
            return Ok(new CouponValidationResponse
            {
                IsValid = false,
                DiscountAmount = 0,
                Message = "This coupon has reached its maximum usage limit."
            });
        }

        if (request.CartSubtotal < coupon.MinOrderAmount)
        {
            return Ok(new CouponValidationResponse
            {
                IsValid = false,
                DiscountAmount = 0,
                Message = $"Minimum order subtotal of ${coupon.MinOrderAmount} is required to use this coupon."
            });
        }

        // Calculate discount
        decimal discountAmount = 0m;
        if (coupon.DiscountType.ToLowerInvariant() == "percentage")
        {
            discountAmount = Math.Round(request.CartSubtotal * coupon.DiscountValue / 100m, 2);
            if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
            {
                discountAmount = coupon.MaxDiscountAmount.Value;
            }
        }
        else // Fixed amount
        {
            discountAmount = coupon.DiscountValue;
        }

        // Ensure discount doesn't exceed subtotal
        if (discountAmount > request.CartSubtotal)
        {
            discountAmount = request.CartSubtotal;
        }

        return Ok(new CouponValidationResponse
        {
            IsValid = true,
            DiscountAmount = discountAmount,
            Message = "Coupon applied successfully!"
        });
    }
}

public class CouponValidationRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal CartSubtotal { get; set; }
}

public class CouponValidationResponse
{
    public bool IsValid { get; set; }
    public decimal DiscountAmount { get; set; }
    public string Message { get; set; } = string.Empty;
}
