namespace Pos.Domain.Entities;

public class DrawerDropTransaction
{
    public Guid Id { get; set; }
    public Guid ShiftId { get; set; }
    public string Type { get; set; } = "PaidIn"; // PaidIn, PaidOut, SafeDrop
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
