// Infrastructure/Services/SyncService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Domain.Entities;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;

namespace Pos.Infrastructure.Services;

public class SyncService : ISyncService
{
    private readonly ApplicationDbContext _context;

    public SyncService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SyncResultDto> ProcessOfflineOrdersAsync(
        List<CreateOrderDto> offlineOrders,
        CancellationToken cancellationToken = default)
    {
        var syncedOrderIds = new List<Guid>();
        var errors = new List<string>();

        if (offlineOrders == null || !offlineOrders.Any())
        {
            return new SyncResultDto(syncedOrderIds, errors);
        }

        // Map parsed order representations
        var mappedOrders = new List<(Guid OrderGuid, string OrderNo, decimal TotalAmount, string PaymentMethod, DateTime CreatedAt, List<(Guid ProductGuid, decimal UnitPrice, int Quantity, decimal? SubTotal, decimal? VatAmount, decimal? ItemDiscount)> Items, string? BranchId, string? PosTerminalId, string? CouponCode, decimal? DiscountAmount)>();

        foreach (var dto in offlineOrders)
        {
            var orderGuid = Guid.TryParse(dto.Id, out var parsedOrderId) ? parsedOrderId : Guid.NewGuid();
            var items = new List<(Guid ProductGuid, decimal UnitPrice, int Quantity, decimal? SubTotal, decimal? VatAmount, decimal? ItemDiscount)>();

            foreach (var itemDto in dto.Items)
            {
                var productGuid = Guid.Empty;
                if (Guid.TryParse(itemDto.ProductId, out var parsedProdId))
                {
                    productGuid = parsedProdId;
                }
                else if (itemDto.ProductId != null && itemDto.ProductId.StartsWith("p") && int.TryParse(itemDto.ProductId.Substring(1), out var index))
                {
                    productGuid = Guid.Parse($"11111111-1111-1111-1111-1111111111{index:D2}");
                }
                items.Add((productGuid, itemDto.UnitPrice, itemDto.Quantity, itemDto.SubTotal, itemDto.VatAmount, itemDto.ItemDiscount));
            }

            mappedOrders.Add((orderGuid, dto.OrderNo, dto.TotalAmount, dto.PaymentMethod, dto.CreatedAt, items, dto.BranchId, dto.PosTerminalId, dto.CouponCode, dto.DiscountAmount));
        }

        // ดึง ExecutionStrategy เพื่อรองรับ EF Core Resilient Connections
        var strategy = _context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // 1. ป้องกัน Duplicate Sync (Idempotency Check)
                var incomingIds = mappedOrders.Select(o => o.OrderGuid).ToList();
                var existingOrderIds = await _context.Orders
                    .Where(o => incomingIds.Contains(o.Id))
                    .Select(o => o.Id)
                    .ToListAsync(cancellationToken);

                var ordersToProcess = mappedOrders
                    .Where(o => !existingOrderIds.Contains(o.OrderGuid))
                    .ToList();

                if (!ordersToProcess.Any())
                {
                    syncedOrderIds.AddRange(existingOrderIds);
                    return;
                }

                // 2. รวบรวม Product IDs ทั้งหมดเพื่อดึงข้อมูลและ Lock Row
                var allProductIds = ordersToProcess
                    .SelectMany(o => o.Items)
                    .Select(i => i.ProductGuid)
                    .Distinct()
                    .ToList();

                var products = await _context.Products
                    .Where(p => allProductIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id, cancellationToken);

                // 3. วนลูปประมวลผลแต่ละ Order
                foreach (var orderTuple in ordersToProcess)
                {
                    string orderNo = orderTuple.OrderNo;
                    var existingByNo = await _context.Orders
                        .FirstOrDefaultAsync(o => o.OrderNo == orderNo, cancellationToken);
                    if (existingByNo != null)
                    {
                        int suffix = 1;
                        string baseOrderNo = orderNo;
                        while (await _context.Orders.AnyAsync(o => o.OrderNo == $"{baseOrderNo}-{suffix}", cancellationToken))
                        {
                            suffix++;
                        }
                        orderNo = $"{baseOrderNo}-{suffix}";
                    }

                    // Calculate VAT (7% inclusive)
                    decimal vatRate = 0.07m;
                    decimal vatAmount = Math.Round(orderTuple.TotalAmount - (orderTuple.TotalAmount / (1m + vatRate)), 2, MidpointRounding.AwayFromZero);
                    decimal subTotal = orderTuple.TotalAmount - vatAmount;

                    var branchGuid = Guid.TryParse(orderTuple.BranchId, out var parsedBranchId) ? parsedBranchId : Guid.Parse("a1111111-a111-a111-a111-a11111111111");
                    
                    string terminalCode = "N02";
                    if (!string.IsNullOrEmpty(orderTuple.PosTerminalId))
                    {
                        if (Guid.TryParse(orderTuple.PosTerminalId, out var parsedTerminalGuid))
                        {
                            var terminal = _context.PosTerminals.Find(parsedTerminalGuid);
                            if (terminal != null)
                            {
                                terminalCode = terminal.TerminalId;
                            }
                        }
                        else
                        {
                            terminalCode = orderTuple.PosTerminalId;
                        }
                    }

                    var newOrder = new Order
                    {
                        Id = orderTuple.OrderGuid,
                        OrderNo = orderNo,
                        PosTerminalId = terminalCode,
                        TotalAmount = orderTuple.TotalAmount,
                        GrandTotal = orderTuple.TotalAmount,
                        SubTotal = subTotal,
                        AmountBeforeVat = subTotal - (orderTuple.DiscountAmount ?? 0m),
                        TotalItemDiscount = string.IsNullOrEmpty(orderTuple.CouponCode) ? (orderTuple.DiscountAmount ?? 0m) : 0m,
                        CouponDiscount = !string.IsNullOrEmpty(orderTuple.CouponCode) ? (orderTuple.DiscountAmount ?? 0m) : 0m,
                        VatAmount = vatAmount,
                        PaymentMethod = orderTuple.PaymentMethod,
                        CreatedAt = orderTuple.CreatedAt,
                        SyncedAt = DateTime.UtcNow,
                        BranchId = branchGuid,
                        WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
                        CashierId = Guid.Parse("99999999-9999-9999-9999-999999999999"), // System Admin
                        SyncStatus = "Synced"
                    };
 
                    if (!string.IsNullOrEmpty(orderTuple.CouponCode))
                    {
                        newOrder.CouponUsage = new CouponUsage
                        {
                            Id = Guid.NewGuid(),
                            OrderId = newOrder.Id,
                            CouponCode = orderTuple.CouponCode,
                            DiscountAmount = orderTuple.DiscountAmount ?? 0m,
                            UsedAt = newOrder.CreatedAt
                        };
                    }

                    foreach (var itemTuple in orderTuple.Items)
                    {
                        if (!products.TryGetValue(itemTuple.ProductGuid, out var product))
                        {
                            errors.Add($"Order {orderTuple.OrderNo}: Product ID {itemTuple.ProductGuid} not found.");
                            continue;
                        }

                        // Calculate item-level VAT (7% inclusive as fallback) if not provided by client
                        decimal itemDiscount = itemTuple.ItemDiscount ?? 0m;
                        decimal rawSubtotal = itemTuple.Quantity * itemTuple.UnitPrice - itemDiscount;
                        decimal calculatedVat = Math.Round(rawSubtotal - (rawSubtotal / 1.07m), 2, MidpointRounding.AwayFromZero);
                        decimal calculatedSubtotalBeforeVat = rawSubtotal - calculatedVat;
 
                        // สร้าง OrderItem
                        newOrder.Items.Add(new OrderItem
                        {
                            Id = Guid.NewGuid(),
                            OrderId = newOrder.Id,
                            ProductId = itemTuple.ProductGuid,
                            UnitPrice = itemTuple.UnitPrice,
                            Quantity = itemTuple.Quantity,
                            ItemDiscount = itemDiscount,
                            SubTotal = itemTuple.SubTotal ?? calculatedSubtotalBeforeVat,
                            VatAmount = itemTuple.VatAmount ?? calculatedVat
                        });

                        // ตัดสต็อก
                        product.StockQuantity -= itemTuple.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;

                        // บันทึก Audit Log
                        _context.StockTransactions.Add(new StockTransaction
                        {
                            Id = Guid.NewGuid(),
                            BranchId = branchGuid,
                            WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
                            ProductId = product.Id,
                            OrderId = newOrder.Id,
                            ChangeQuantity = -itemTuple.Quantity,
                            TransactionType = "OfflineSaleSync",
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    _context.Orders.Add(newOrder);
                    syncedOrderIds.Add(newOrder.Id);
                }

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                syncedOrderIds.AddRange(existingOrderIds);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                errors.Add($"Sync Batch Failed: {ex.Message}");
                syncedOrderIds.Clear();
            }
        });

        return new SyncResultDto(syncedOrderIds, errors);
    }
}