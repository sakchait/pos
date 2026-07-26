namespace Pos.Domain.Entities;

public class CashierShift
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public string PosTerminalId { get; set; } = string.Empty;
    public Guid CashierId { get; set; }
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public decimal OpeningCash { get; set; }
    public decimal TotalSystemCashSales { get; set; }
    public decimal TotalCashPaidIn { get; set; }
    public decimal TotalCashPaidOut { get; set; }
    public decimal ExpectedCash { get; set; }
    public decimal? ActualCashCounted { get; set; }
    public decimal? CashDifference { get; set; }

    public string Status { get; set; } = "Open"; // Open, Closed
    public string? CloseNotes { get; set; }

    public User? Cashier { get; set; }
}
