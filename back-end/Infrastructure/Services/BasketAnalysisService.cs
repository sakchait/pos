// Services/BasketAnalysisService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;
namespace Pos.Infrastructure.Services;

public class BasketAnalysisService : IBasketAnalysisService
{
    private readonly ApplicationDbContext _context;

    public BasketAnalysisService(ApplicationDbContext context) => _context = context;

    /// <summary>
    /// คำนวณคู่สินค้าที่ถูกซื้อพร้อมกันบ่อยที่สุด (Market Basket Analysis)
    /// </summary>
    public async Task GenerateProductPairsAsync()
    {
        // ดึงรายการ Orderที่มีสินค้ามากกว่า 1 ชิ้น ในช่วง 30 วันที่ผ่านมา
        var recentOrders = await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.CreatedAt >= DateTime.UtcNow.AddDays(-30) && o.Items.Count > 1)
            .Select(o => o.Items.Select(i => i.ProductId).ToList())
            .ToListAsync();

        var pairCounts = new Dictionary<(Guid, Guid), int>();

        foreach (var orderItems in recentOrders)
        {
            var distinctProducts = orderItems.Distinct().ToList();
            for (int i = 0; i < distinctProducts.Count; i++)
            {
                for (int j = i + 1; j < distinctProducts.Count; j++)
                {
                    var pair = (distinctProducts[i], distinctProducts[j]);
                    pairCounts[pair] = pairCounts.GetValueOrDefault(pair, 0) + 1;
                }
            }
        }

        // บันทึกคู่ที่มีการซื้อร่วมกันสูงสุดลงใน ProductAssociations
        // ... (โค้ด Save ลง DB) ...
    }
}