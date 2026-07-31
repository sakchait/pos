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
[Route("api/ecommerce/orders")]
public class EcommerceOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EcommerceOrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Checkout([FromBody] EcommerceCheckoutRequest request, CancellationToken cancellationToken)
    {
        if (request == null || !request.Items.Any())
        {
            return BadRequest(new { message = "Cart is empty." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var systemAdminId = Guid.Parse("99999999-9999-9999-9999-999999999999");
            var branchGuid = Guid.Parse("A1111111-A111-A111-A111-A11111111111"); // HeadOffice
            var warehouseGuid = Guid.Parse("B1111111-B111-B111-B111-B11111111111"); // MainWarehouse

            // 1. Ensure active shift exists for system online channel
            var activeShift = await _context.CashierShifts
                .FirstOrDefaultAsync(s => s.CashierId == systemAdminId && s.PosTerminalId == "ONLINE" && s.Status == "Open", cancellationToken);

            if (activeShift == null)
            {
                activeShift = new CashierShift
                {
                    Id = Guid.NewGuid(),
                    BranchId = branchGuid,
                    PosTerminalId = "ONLINE",
                    CashierId = systemAdminId,
                    OpenedAt = DateTime.UtcNow,
                    OpeningCash = 0.00m,
                    Status = "Open"
                };
                _context.CashierShifts.Add(activeShift);
                await _context.SaveChangesAsync(cancellationToken);
            }

            // 2. Generate unique OrderNo
            string orderNo = await GenerateEcommerceOrderNoAsync(cancellationToken);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                BranchId = branchGuid,
                WarehouseId = warehouseGuid,
                CashierId = systemAdminId,
                ShiftId = activeShift.Id,
                PosTerminalId = "ONLINE",
                OrderNo = orderNo,
                CreatedAt = DateTime.UtcNow,
                SyncedAt = DateTime.UtcNow,
                SyncStatus = "Synced",
                PaymentMethod = request.PaymentMethod
            };

            decimal calculatedSubtotal = 0m;
            decimal totalDiscount = 0m;

            // 3. Process items
            foreach (var checkoutItem in request.Items)
            {
                var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == checkoutItem.ProductId && p.IsActive, cancellationToken);
                if (product == null)
                {
                    return BadRequest(new { message = $"Product with ID '{checkoutItem.ProductId}' not found or inactive." });
                }

                if (product.StockQuantity < checkoutItem.Quantity)
                {
                    return BadRequest(new { message = $"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}." });
                }

                // Calculate product-level discounts (if defined on the product)
                decimal unitPrice = product.Price;
                decimal itemDiscount = 0m;
                if (product.DiscountPercentage > 0)
                {
                    itemDiscount = Math.Round((unitPrice * product.DiscountPercentage / 100m), 2) * checkoutItem.Quantity;
                }
                else if (product.DiscountAmount > 0)
                {
                    itemDiscount = product.DiscountAmount * checkoutItem.Quantity;
                }

                decimal rawItemSubtotal = (unitPrice * checkoutItem.Quantity) - itemDiscount;
                decimal itemVat = Math.Round(rawItemSubtotal - (rawItemSubtotal / 1.07m), 2, MidpointRounding.AwayFromZero);
                decimal itemSubtotalExclVat = rawItemSubtotal - itemVat;

                order.Items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = product.Id,
                    UnitPrice = unitPrice,
                    Quantity = checkoutItem.Quantity,
                    ItemDiscount = itemDiscount,
                    SubTotal = itemSubtotalExclVat,
                    VatAmount = itemVat
                });

                calculatedSubtotal += unitPrice * checkoutItem.Quantity;
                totalDiscount += itemDiscount;

                // 4. Reduce stock
                product.StockQuantity -= checkoutItem.Quantity;
                product.UpdatedAt = DateTime.UtcNow;

                // 5. Add stock transaction log
                _context.StockTransactions.Add(new StockTransaction
                {
                    Id = Guid.NewGuid(),
                    BranchId = branchGuid,
                    WarehouseId = warehouseGuid,
                    ProductId = product.Id,
                    OrderId = order.Id,
                    ChangeQuantity = -checkoutItem.Quantity,
                    TransactionType = "OnlineSale",
                    CreatedAt = DateTime.UtcNow
                });
            }

            // 6. Handle Promo/Coupon Code if provided
            decimal couponDiscountAmount = 0m;
            if (!string.IsNullOrEmpty(request.PromoCode))
            {
                var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == request.PromoCode && c.IsActive, cancellationToken);
                if (coupon != null && DateTime.UtcNow >= coupon.StartDate && DateTime.UtcNow <= coupon.EndDate)
                {
                    // Check subtotal limit
                    if (calculatedSubtotal - totalDiscount >= coupon.MinOrderAmount)
                    {
                        if (coupon.DiscountType.ToLowerInvariant() == "percentage")
                        {
                            couponDiscountAmount = Math.Round((calculatedSubtotal - totalDiscount) * coupon.DiscountValue / 100m, 2);
                            if (coupon.MaxDiscountAmount.HasValue && couponDiscountAmount > coupon.MaxDiscountAmount.Value)
                            {
                                couponDiscountAmount = coupon.MaxDiscountAmount.Value;
                            }
                        }
                        else // Fixed
                        {
                            couponDiscountAmount = coupon.DiscountValue;
                        }

                        order.CouponDiscount = couponDiscountAmount;
                        order.CouponUsage = new CouponUsage
                        {
                            Id = Guid.NewGuid(),
                            OrderId = order.Id,
                            CouponCode = coupon.Code,
                            DiscountAmount = couponDiscountAmount,
                            UsedAt = order.CreatedAt
                        };

                        coupon.UsedCount += 1;
                    }
                }
            }

            order.SubTotal = calculatedSubtotal;
            order.TotalItemDiscount = totalDiscount;
            
            decimal finalAmountAfterAllDiscounts = calculatedSubtotal - totalDiscount - couponDiscountAmount;
            decimal totalVat = Math.Round(finalAmountAfterAllDiscounts - (finalAmountAfterAllDiscounts / 1.07m), 2, MidpointRounding.AwayFromZero);
            
            order.AmountBeforeVat = finalAmountAfterAllDiscounts - totalVat;
            order.VatAmount = totalVat;
            order.GrandTotal = finalAmountAfterAllDiscounts;
            order.TotalAmount = finalAmountAfterAllDiscounts;

            // 7. Add Payment Entry
            order.Payments.Add(new OrderPayment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                PaymentMethod = request.PaymentMethod,
                Amount = finalAmountAfterAllDiscounts,
                ReferenceNo = request.PaymentReference,
                CreatedAt = order.CreatedAt
            });

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Ok(new
            {
                message = "Checkout completed successfully.",
                orderId = order.Id.ToString(),
                orderNo = order.OrderNo,
                total = order.GrandTotal
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return StatusCode(500, new { message = "An error occurred during checkout.", detail = ex.Message });
        }
    }

    private async Task<string> GenerateEcommerceOrderNoAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var todayStart = today.Date;
        var todayEnd = todayStart.AddDays(1);
        
        int todayCount = await _context.Orders
            .CountAsync(o => o.PosTerminalId == "ONLINE" && o.CreatedAt >= todayStart && o.CreatedAt < todayEnd, cancellationToken);
        
        string yy = today.ToString("yy");
        string mm = today.ToString("MM");
        string dd = today.ToString("dd");
        string sequence = (todayCount + 1).ToString("D6");
        
        return $"WEB{yy}{mm}{dd}ONLINE-{sequence}";
    }
}

public class EcommerceCheckoutRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public List<CheckoutItemDto> Items { get; set; } = new();
    public string? PromoCode { get; set; }
    public string PaymentMethod { get; set; } = "CreditCard";
    public string? PaymentReference { get; set; }
}

public class CheckoutItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public string? SelectedColor { get; set; }
    public string? SelectedSize { get; set; }
}
