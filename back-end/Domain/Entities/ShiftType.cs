namespace Pos.Domain.Entities;

public class ShiftType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // กะเช้า, กะบ่าย, กะดึก
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

public class ShiftSchedule
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public int ShiftTypeId { get; set; }
    public DateTime WorkDate { get; set; }
    public Guid UserId { get; set; }
    public string RoleInShift { get; set; } = "Cashier"; // Manager, Cashier
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Absent

    public User? User { get; set; }
    public ShiftType? ShiftType { get; set; }
}
