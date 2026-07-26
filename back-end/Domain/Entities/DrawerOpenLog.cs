namespace Pos.Domain.Entities;

public class DrawerOpenLog
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public string PosTerminalId { get; set; } = string.Empty;
    public Guid ShiftId { get; set; }
    public Guid CashierId { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
}
