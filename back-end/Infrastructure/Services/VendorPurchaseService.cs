// Services/VendorPurchaseService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Persistence;
using Pos.Domain.Entities;
using Pos.Infrastructure.Interfaces;

namespace Pos.Infrastructure.Services;

public class VendorPurchaseService : IVendorPurchaseService
{
    private readonly ApplicationDbContext _context;

    public VendorPurchaseService(ApplicationDbContext context) => _context = context;

    /// <summary>
    /// เมื่อผู้จัดซื้อกด Approve ใบเสนอสินค้า (PO) ระบบจะทำการอัปเดตสต็อกและสร้าง FIFO Stock Batch
    /// </summary>
    public async Task<bool> ApprovePoAndReceiveStockAsync(Guid poId, Guid purchaserUserId, CancellationToken cancellationToken)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == poId, cancellationToken);

            if (po == null || po.Status != "Proposed")
                return false;

            // 1. อัปเดตสถานะ PO
            po.Status = "Approved";
            po.ApprovedBy = purchaserUserId;
            po.ApprovedAt = DateTime.UtcNow;

            foreach (var item in po.Items)
            {
                // 2. อัปเดตยอดคงเหลือในตาราง WarehouseInventories
                var inventory = await _context.WarehouseInventories
                    .FirstOrDefaultAsync(w => w.WarehouseId == po.WarehouseId && w.ProductId == item.ProductId, cancellationToken);

                if (inventory == null)
                {
                    _context.WarehouseInventories.Add(new WarehouseInventory
                    {
                        WarehouseId = po.WarehouseId,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity
                    });
                }
                else
                {
                    inventory.Quantity += item.Quantity; // เติมสต็อกเพิ่ม
                }

                // 3. สร้าง FIFO Batch ใหม่ (สำหรับนำไปตัดต้นทุนแบบ FIFO ตอนขาย)
                _context.StockBatches.Add(new StockBatch
                {
                    Id = Guid.NewGuid(),
                    WarehouseId = po.WarehouseId,
                    ProductId = item.ProductId,
                    PurchaseOrderId = po.Id,
                    BatchNumber = $"LOT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..4]}",
                    UnitCost = item.UnitPrice,
                    InitialQuantity = item.Quantity,
                    RemainingQuantity = item.Quantity,
                    ReceivedDate = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}