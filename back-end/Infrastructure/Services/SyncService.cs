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
        var mappedOrders = new List<(Guid OrderGuid, string OrderNo, decimal TotalAmount, string PaymentMethod, DateTime CreatedAt, List<(Guid ProductGuid, decimal UnitPrice, int Quantity)> Items)>();

        foreach (var dto in offlineOrders)
        {
            var orderGuid = Guid.TryParse(dto.Id, out var parsedOrderId) ? parsedOrderId : Guid.NewGuid();
            var items = new List<(Guid ProductGuid, decimal UnitPrice, int Quantity)>();

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
                items.Add((productGuid, itemDto.UnitPrice, itemDto.Quantity));
            }

            mappedOrders.Add((orderGuid, dto.OrderNo, dto.TotalAmount, dto.PaymentMethod, dto.CreatedAt, items));
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
                    var newOrder = new Order
                    {
                        Id = orderTuple.OrderGuid,
                        OrderNo = orderTuple.OrderNo,
                        PosTerminalId = "term-1",
                        TotalAmount = orderTuple.TotalAmount,
                        GrandTotal = orderTuple.TotalAmount,
                        SubTotal = orderTuple.TotalAmount,
                        PaymentMethod = orderTuple.PaymentMethod,
                        CreatedAt = orderTuple.CreatedAt,
                        SyncedAt = DateTime.UtcNow,
                        BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"), // Head Office
                        WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"), // Main Warehouse
                        CashierId = Guid.Parse("99999999-9999-9999-9999-999999999999"), // System Admin
                        SyncStatus = "Synced"
                    };

                    foreach (var itemTuple in orderTuple.Items)
                    {
                        if (!products.TryGetValue(itemTuple.ProductGuid, out var product))
                        {
                            errors.Add($"Order {orderTuple.OrderNo}: Product ID {itemTuple.ProductGuid} not found.");
                            continue;
                        }

                        // สร้าง OrderItem
                        newOrder.Items.Add(new OrderItem
                        {
                            Id = Guid.NewGuid(),
                            OrderId = newOrder.Id,
                            ProductId = itemTuple.ProductGuid,
                            UnitPrice = itemTuple.UnitPrice,
                            Quantity = itemTuple.Quantity,
                            SubTotal = itemTuple.Quantity * itemTuple.UnitPrice
                        });

                        // ตัดสต็อก
                        product.StockQuantity -= itemTuple.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;

                        // บันทึก Audit Log
                        _context.StockTransactions.Add(new StockTransaction
                        {
                            Id = Guid.NewGuid(),
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