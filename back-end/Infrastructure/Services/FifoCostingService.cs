// Services/FifoCostingService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;
namespace Pos.Infrastructure.Services;

public class FifoCostingService : IFifoCostingService
{
    private readonly ApplicationDbContext _context;

    public FifoCostingService(ApplicationDbContext context) => _context = context;

    /// <summary>
    /// คำนวณตัดต้นทุนขายตามหลัก FIFO ( First-In, First-Out )
    /// </summary>
    public async Task<decimal> DeductFifoStockAndCalculateCogsAsync(Guid warehouseId, Guid productId, int quantityToDeduct)
    {
        decimal totalCogs = 0; // ต้นทุนขายรวมของรายการนี้
        int remainingToDeduct = quantityToDeduct;

        // ดึง Stock Batches ของสินค้านี้ เรียงตามวันที่นำเข้าเก่าที่สุดก่อน (FIFO)
        var batches = await _context.StockBatches
            .Where(b => b.WarehouseId == warehouseId && b.ProductId == productId && b.RemainingQuantity > 0)
            .OrderBy(b => b.ReceivedDate)
            .ToListAsync();

        foreach (var batch in batches)
        {
            if (remainingToDeduct <= 0) break;

            if (batch.RemainingQuantity >= remainingToDeduct)
            {
                // ล็อตนี้มีสินค้าพอสำหรับตัดทั้งหมด
                batch.RemainingQuantity -= remainingToDeduct;
                totalCogs += remainingToDeduct * batch.UnitCost;
                remainingToDeduct = 0;
            }
            else
            {
                // ล็อตนี้มีสินค้าน้อยกว่าที่ต้องการตัด -> ตัดล็อตนี้หมดแล้วไปตัดล็อตถัดไป
                totalCogs += batch.RemainingQuantity * batch.UnitCost;
                remainingToDeduct -= batch.RemainingQuantity;
                batch.RemainingQuantity = 0;
            }
        }

        await _context.SaveChangesAsync();
        return totalCogs; // ส่งคืนมูลค่าต้นทุนขายจริงตามหลัก FIFO
    }
}