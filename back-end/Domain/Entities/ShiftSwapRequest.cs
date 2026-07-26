namespace Pos.Domain.Entities;

public class ShiftSwapRequest
{
    public Guid Id { get; set; }
    public Guid RequestorShiftId { get; set; }
    public Guid TargetUserId { get; set; }
    public Guid? TargetShiftId { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "PendingPeer"; // PendingPeer, PendingManager, Approved, Rejected
    public Guid? ManagerApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ShiftSchedule? RequestorShift { get; set; }
}
