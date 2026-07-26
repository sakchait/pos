// Services/AntiFraudAnalysisService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Entities;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;
namespace Pos.Infrastructure.Services;

public class AntiFraudAnalysisService : IAntiFraudAnalysisService
{
    private readonly ApplicationDbContext _context;

    public AntiFraudAnalysisService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// ตรวจสอบพฤติกรรมผิดปกติประจำวันของ Cashier แต่ละคน
    /// </summary>
    public async Task CheckCashierAnomaliesAsync(Guid cashierId, Guid shiftId)
    {
        // 1. ตรวจสอบจำนวนครั้งที่มีการ Void สินค้า/บิล
        var voidCount = await _context.VoidLogs
            .CountAsync(v => v.CashierId == cashierId && v.ShiftId == shiftId);

        if (voidCount > 5) // เกิน 5 ครั้งต่อกะ ถือว่าผิดปกติ
        {
            await FlagSuspiciousActivity(cashierId, shiftId, $"High Void Rate: Voided {voidCount} times in a single shift.");
        }

        // 2. ตรวจสอบจำนวนครั้งที่เปิดลิ้นชักเปล่า (No-Sale Drawer Open)
        var noSaleOpens = await _context.DrawerOpenLogs
            .CountAsync(d => d.CashierId == cashierId && d.ShiftId == shiftId);

        if (noSaleOpens > 3)
        {
            await FlagSuspiciousActivity(cashierId, shiftId, $"High No-Sale Drawer Opens: Opened {noSaleOpens} times without sales.");
        }

        // 3. ตรวจสอบผลต่างเงินสดตอนปิดกะ (Cash Shortage)
        var shift = await _context.CashierShifts.FindAsync(shiftId);
        if (shift != null && shift.CashDifference < -200) // เงินขาดเกิน 200 บาท
        {
            await FlagSuspiciousActivity(cashierId, shiftId, $"Significant Cash Shortage: Missing {shift.CashDifference} THB.");
        }
    }

    private async Task FlagSuspiciousActivity(Guid cashierId, Guid shiftId, string reason)
    {
        _context.SystemAuditLogs.Add(new SystemAuditLog
        {
            UserId = cashierId,
            Action = "SUSPICIOUS_BEHAVIOR_FLAG",
            Description = $"ShiftId: {shiftId} - {reason}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }
}