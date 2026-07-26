// Services/ShiftGeneratorService.cs
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Entities;
using Pos.Domain.Persistence;
using Pos.Infrastructure.Interfaces;

namespace Pos.Infrastructure.Services;

public class ShiftGeneratorService : IShiftGeneratorService
{
    private readonly ApplicationDbContext _context;

    public ShiftGeneratorService(ApplicationDbContext context) => _context = context;

    public async Task<bool> GenerateWeeklyScheduleAsync(Guid branchId, DateTime startDate, CancellationToken cancellationToken)
    {
        var endDate = startDate.AddDays(7);

        // 1. ดึงข้อมูลพนักงานทั้งหมดในสาขา
        var managers = await _context.Users.Where(u => u.BranchId == branchId && u.Role.Name == "Manager").ToListAsync();
        var cashiers = await _context.Users.Where(u => u.BranchId == branchId && u.Role.Name == "Cashier").ToListAsync();

        // 2. ดึงรายการวันลาที่ได้รับการอนุมัติแล้วในช่วงเวลานี้
        var approvedLeaves = await _context.LeaveRequests
            .Where(l => l.Status == "Approved" && l.StartDate <= endDate && l.EndDate >= startDate)
            .ToListAsync();

        var shiftTypes = await _context.ShiftTypes.ToListAsync();

        for (var date = startDate.Date; date < endDate.Date; date = date.AddDays(1))
        {
            foreach (var shiftType in shiftTypes)
            {
                // กรองเฉพาะพนักงานที่ไม่ติดวันลาในวันนี้
                var availableManagers = managers
                    .Where(m => !approvedLeaves.Any(l => l.UserId == m.Id && date >= l.StartDate && date <= l.EndDate))
                    .ToList();

                var availableCashiers = cashiers
                    .Where(c => !approvedLeaves.Any(l => l.UserId == c.Id && date >= l.StartDate && date <= l.EndDate))
                    .ToList();

                // ตรวจสอบกฎห้ามทำ 3 กะติดต่อกันก่อนจัดลงตาราง
                var selectedManager = SelectEligibleUser(availableManagers, date, shiftType.Id);
                var selectedCashiers = SelectEligibleCashiers(availableCashiers, date, shiftType.Id, count: 2);

                if (selectedManager != null)
                {
                    _context.ShiftSchedules.Add(new ShiftSchedule
                    {
                        BranchId = branchId,
                        ShiftTypeId = shiftType.Id,
                        WorkDate = date,
                        UserId = selectedManager.Id,
                        RoleInShift = "Manager"
                    });
                }

                foreach (var cashier in selectedCashiers)
                {
                    _context.ShiftSchedules.Add(new ShiftSchedule
                    {
                        BranchId = branchId,
                        ShiftTypeId = shiftType.Id,
                        WorkDate = date,
                        UserId = cashier.Id,
                        RoleInShift = "Cashier"
                    });
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private User? SelectEligibleUser(List<User> users, DateTime date, int shiftTypeId)
    {
        foreach (var user in users)
        {
            if (CanWorkShift(user.Id, date, shiftTypeId))
                return user;
        }
        return null;
    }

    private List<User> SelectEligibleCashiers(List<User> users, DateTime date, int shiftTypeId, int count)
    {
        var selectedUsers = new List<User>();
        foreach (var user in users)
        {
            if (CanWorkShift(user.Id, date, shiftTypeId))
            {
                selectedUsers.Add(user);
                if (selectedUsers.Count == count)
                    break;
            }
        }
        return selectedUsers;
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