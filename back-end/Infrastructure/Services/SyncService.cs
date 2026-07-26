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

        // ดึง ExecutionStrategy เพื่อรองรับ EF Core Resilient Connections (กรณี DB หลุดชั่วคราว)
        var strategy = _context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            // ใช้ Transaction เพื่อให้กระบวนการตัดสต็อกและสร้าง Order เป็น Atomic Operation
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // 1. ป้องกัน Duplicate Sync (Idempotency Check)
                // ดึง Order IDs ทั้งหมดที่เคย Sync เข้ามาในระบบแล้ว
                var incomingIds = offlineOrders.Select(o => o.Id).ToList();
                var existingOrderIds = await _context.Orders
                    .Where(o => incomingIds.Contains(o.Id))
                    .Select(o => o.Id)
                    .ToListAsync(cancellationToken);

                // คัดกรองเอาเฉพาะ Order ที่ยังไม่เคย Sync
                var ordersToProcess = offlineOrders
                    .Where(o => !existingOrderIds.Contains(o.Id))
                    .ToList();

                // หากทุก Order เคย Sync ไปแล้ว ให้จบการทำงานทันที
                if (!ordersToProcess.Any())
                {
                    syncedOrderIds.AddRange(existingOrderIds);
                    return;
                }

                // 2. รวบรวม Product IDs ทั้งหมดเพื่อดึงข้อมูลและ Lock Row สำหรับตัดสต็อก
                var allProductIds = ordersToProcess
                    .SelectMany(o => o.Items)
                    .Select(i => i.ProductId)
                    .Distinct()
                    .ToList();

                var products = await _context.Products
                    .Where(p => allProductIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id, cancellationToken);

                // 3. วนลูปประมวลผลแต่ละ Order
                foreach (var orderDto in ordersToProcess)
                {
                    var newOrder = new Order
                    {
                        Id = orderDto.Id,
                        OrderNo = orderDto.OrderNo,
                        PosTerminalId = orderDto.PosTerminalId,
                        TotalAmount = orderDto.TotalAmount,
                        PaymentMethod = orderDto.PaymentMethod,
                        CreatedAt = orderDto.CreatedAt,
                        SyncedAt = DateTime.UtcNow
                    };

                    foreach (var itemDto in orderDto.Items)
                    {
                        if (!products.TryGetValue(itemDto.ProductId, out var product))
                        {
                            errors.Add($"Order {orderDto.OrderNo}: Product ID {itemDto.ProductId} not found.");
                            continue;
                        }

                        // สร้าง OrderItem
                        newOrder.Items.Add(new OrderItem
                        {
                            Id = Guid.NewGuid(),
                            OrderId = newOrder.Id,
                            ProductId = itemDto.ProductId,
                            UnitPrice = itemDto.UnitPrice,
                            Quantity = itemDto.Quantity
                        });

                        // 4. ตัดสต็อกสินค้าชั่วคราว (ทอนจำนวนลง)
                        product.StockQuantity -= itemDto.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;

                        // 5. บันทึก Audit Log ประวัติการตัดสต็อก
                        _context.StockTransactions.Add(new StockTransaction
                        {
                            Id = Guid.NewGuid(),
                            ProductId = product.Id,
                            OrderId = newOrder.Id,
                            ChangeQuantity = -itemDto.Quantity, // ติดลบคือตัดสต็อกออก
                            TransactionType = "OfflineSaleSync",
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    _context.Orders.Add(newOrder);
                    syncedOrderIds.Add(newOrder.Id);
                }

                // 6. Commit ข้อมูลทั้งหมดลง SQL Server
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                // รวม ID ที่เคย Sync อยู่แล้วเข้าไปด้วย เพื่อแจ้ง Client ว่าประมวลผลเรียบร้อยแล้ว
                syncedOrderIds.AddRange(existingOrderIds);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                errors.Add($"Sync Batch Failed: {ex.Message}");
                syncedOrderIds.Clear(); // เคลียร์รายการหาก Batch ล้มเหลว
            }
        });

        return new SyncResultDto(syncedOrderIds, errors);
    }
}