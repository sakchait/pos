using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Pos.Infrastructure.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
public class OrdersController : ControllerBase
{
    private readonly ISyncService _syncService;
    private readonly IRepository<Order> _ordersRepo;
    private readonly IRepository<CashierShift> _shiftRepo;
    private readonly IRepository<User> _usersRepo;

    public OrdersController(
        ISyncService syncService,
        IRepository<Order> ordersRepo,
        IRepository<CashierShift> shiftRepo,
        IRepository<User> usersRepo)
    {
        _syncService = syncService;
        _ordersRepo = ordersRepo;
        _shiftRepo = shiftRepo;
        _usersRepo = usersRepo;
    }

    // 1. GET /api/orders - Retrieves all transactions mapped to frontend Order DTO
    [HttpGet("/api/orders")]
    public async Task<IActionResult> GetOrders(CancellationToken cancellationToken)
    {
        var list = await _ordersRepo.GetAll()
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.Payments)
            .Include(o => o.Member)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        // Fetch Cashier Users
        var cashierIds = list.Select(o => o.CashierId).Distinct().ToList();
        var cashiers = await _usersRepo.GetAll()
            .AsNoTracking()
            .Where(u => cashierIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName, cancellationToken);

        var result = list.Select(o => new
        {
            id = o.Id.ToString(),
            orderNo = o.OrderNo,
            subtotal = (double)o.SubTotal,
            vatRate = 0.07,
            vatAmount = (double)o.VatAmount,
            isVatInclusive = true,
            couponCode = o.CouponUsage?.CouponCode,
            discountAmount = (double)(o.CouponDiscount + o.TotalItemDiscount),
            grandTotal = (double)o.GrandTotal,
            status = "COMPLETED",
            createdAt = o.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            hmacSignature = o.HmacSignature ?? "",
            cashierId = o.CashierId.ToString(),
            cashierName = cashiers.TryGetValue(o.CashierId, out var name) ? name : "Unknown Cashier",
            memberId = o.MemberId?.ToString(),
            memberName = o.Member?.FullName,
            items = o.Items.Select(i => new
            {
                product = new
                {
                    id = i.ProductId.ToString(),
                    sku = i.Product?.Code ?? "",
                    name = i.Product?.Name ?? "Unknown Product",
                    price = (double)(i.Product?.Price ?? 0m),
                    stock = i.Product?.StockQuantity ?? 0,
                    category = i.Product != null ? MapCategory(i.Product.Code) : "Food",
                    image = i.Product != null ? MapImage(i.Product.Code) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                    isActive = i.Product?.IsActive ?? true
                },
                quantity = i.Quantity,
                selectedModifiers = new List<string>(),
                itemDiscount = (double)i.ItemDiscount
            }).ToList(),
            payments = o.Payments.Select(p => new
            {
                id = p.Id.ToString(),
                method = p.PaymentMethod,
                amount = (double)p.Amount,
                referenceNo = p.ReferenceNo,
                timestamp = p.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    // 2. POST /api/orders - Adds a new order record
    public class ProductDto
    {
        public string Id { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    public class CartItemDto
    {
        public ProductDto Product { get; set; } = new();
        public int Quantity { get; set; }
        public decimal ItemDiscount { get; set; }
    }

    public class PaymentDto
    {
        public string Id { get; set; } = string.Empty;
        public string Method { get; set; } = "Cash";
        public decimal Amount { get; set; }
        public string? ReferenceNo { get; set; }
        public string Timestamp { get; set; } = string.Empty;
    }

    public class OrderRequestDto
    {
        public string Id { get; set; } = string.Empty;
        public string OrderNo { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal VatAmount { get; set; }
        public string? CouponCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public string CashierId { get; set; } = string.Empty;
        public string? MemberId { get; set; }
        public string? HmacSignature { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public List<PaymentDto> Payments { get; set; } = new();
        public string CreatedAt { get; set; } = string.Empty;
    }

    [HttpPost("/api/orders")]
    public async Task<IActionResult> AddOrder([FromBody] OrderRequestDto request, CancellationToken cancellationToken)
    {
        var orderGuid = Guid.TryParse(request.Id, out var parsedOrderId) ? parsedOrderId : Guid.NewGuid();

        // Prevent duplicates
        var existing = await _ordersRepo.GetAll()
            .FirstOrDefaultAsync(o => o.Id == orderGuid || o.OrderNo == request.OrderNo, cancellationToken);
        if (existing != null)
        {
            return Ok(new { message = "Order already exists.", id = existing.Id });
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

        var order = new Order
        {
            Id = orderGuid,
            BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"), // Head Office
            WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
            CashierId = cashierGuid,
            MemberId = Guid.TryParse(request.MemberId, out var parsedMemberId) ? parsedMemberId : null,
            ShiftId = activeShift.Id,
            PosTerminalId = "term-1",
            OrderNo = request.OrderNo,
            SubTotal = request.Subtotal,
            TotalItemDiscount = string.IsNullOrEmpty(request.CouponCode) ? request.DiscountAmount : 0m,
            CouponDiscount = !string.IsNullOrEmpty(request.CouponCode) ? request.DiscountAmount : 0m,
            AmountBeforeVat = request.Subtotal - request.DiscountAmount,
            VatAmount = request.VatAmount,
            GrandTotal = request.GrandTotal,
            TotalAmount = request.GrandTotal,
            PaymentMethod = request.Payments.FirstOrDefault()?.Method ?? "Cash",
            SyncStatus = "Synced",
            HmacSignature = request.HmacSignature,
            CreatedAt = DateTime.TryParse(request.CreatedAt, out var parsedCreated) ? parsedCreated : DateTime.UtcNow,
            SyncedAt = DateTime.UtcNow
        };

        foreach (var item in request.Items)
        {
            order.Items.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductId = Guid.TryParse(item.Product.Id, out var parsedProdId) ? parsedProdId : Guid.Empty,
                UnitPrice = item.Product.Price,
                Quantity = item.Quantity,
                ItemDiscount = item.ItemDiscount,
                SubTotal = item.Quantity * item.Product.Price - item.ItemDiscount
            });
        }

        foreach (var pay in request.Payments)
        {
            order.Payments.Add(new OrderPayment
            {
                Id = Guid.TryParse(pay.Id, out var parsedPayId) ? parsedPayId : Guid.NewGuid(),
                OrderId = order.Id,
                PaymentMethod = pay.Method,
                Amount = pay.Amount,
                ReferenceNo = pay.ReferenceNo,
                CreatedAt = DateTime.TryParse(pay.Timestamp, out var parsedTimestamp) ? parsedTimestamp : DateTime.UtcNow
            });
        }

        await _ordersRepo.AddAsync(order);
        return Ok(new { message = "Order added successfully.", id = order.Id });
    }

    /// <summary>
    /// รับ Batch Orders จาก PWA Offline Storage มาทำการ Sync ลง SQL Server
    /// </summary>
    [HttpPost("/api/sync/orders")]
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

    private static string MapCategory(string sku)
    {
        return sku switch
        {
            "0012" => "Salad",
            "0054" => "Burger",
            "0098" => "Coffee",
            "0112" => "Dessert",
            "0087" => "Meat",
            "0041" => "Snack",
            "0203" => "Tea",
            "0319" => "Meat",
            _ => "Food"
        };
    }

    private static string MapImage(string sku)
    {
        return sku switch
        {
            "0012" => "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60",
            "0054" => "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
            "0098" => "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=60",
            "0112" => "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60",
            "0087" => "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
            "0041" => "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
            "0203" => "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60",
            "0319" => "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=500&auto=format&fit=crop&q=60",
            _ => "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60"
        };
    }
}