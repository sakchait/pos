namespace Pos.Domain.Entities;

public class VoidLog
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public Guid ShiftId { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Amount { get; set; }
    public Guid CashierId { get; set; }
    public Guid ManagerId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
