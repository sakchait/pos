// Services/ShiftSwapService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;
namespace Pos.Infrastructure.Services;

public class ShiftSwapService : IShiftSwapService
{
    private readonly ApplicationDbContext _context;

    public ShiftSwapService(ApplicationDbContext context) => _context = context;
    public async Task<bool> ApproveShiftSwapAsync(Guid swapRequestId, Guid managerId)
    {
        var swapRequest = await _context.ShiftSwapRequests
            .Include(r => r.RequestorShift)
            .FirstOrDefaultAsync(r => r.Id == swapRequestId);

        if (swapRequest == null || (swapRequest.Status != "PendingManager" && swapRequest.Status != "PendingPeer"))
            return false;

        // ตรวจสอบอีกครั้งว่าหากสลับกะแล้ว พนักงานปลายทางจะผิดกฎควง 3 กะหรือไม่
        var targetShift = swapRequest.RequestorShift;
        if (!CanWorkShift(swapRequest.TargetUserId, targetShift.WorkDate, targetShift.ShiftTypeId))
        {
            throw new InvalidOperationException("ไม่สามารถอนุมัติได้ เนื่องจากพนักงานปลายทางจะทำกะติดต่อกันเกิน 2 กะ (ผิดกฎ 3 กะต่อเนื่อง)");
        }

        // ทำการสลับ User ใน ShiftSchedule
        targetShift.UserId = swapRequest.TargetUserId;
        swapRequest.Status = "Approved";
        swapRequest.ManagerApprovedBy = managerId;

        await _context.SaveChangesAsync();
        return true;
    }

    // กฎเหล็ก: ตรวจสอบห้ามทำ 3 กะติดต่อกัน (24 ชม.)
    private bool CanWorkShift(Guid userId, DateTime date, int currentShiftTypeId)
    {
        // ดึงประวัติกะก่อนหน้า 24 ชั่วโมง
        var consecutiveShiftsCount = _context.ShiftSchedules
            .Count(s => s.UserId == userId &&
                        s.WorkDate >= date.AddDays(-1) &&
                        s.WorkDate <= date);

        // หากทำไปแล้ว 2 กะติด ห้ามจัดกะที่ 3 เด็ดขาด
        return consecutiveShiftsCount < 2;
    }
}