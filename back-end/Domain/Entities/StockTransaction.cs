namespace Pos.Domain.Entities;

public class StockTransaction
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? OrderId { get; set; }
    public int ChangeQuantity { get; set; }
    public string TransactionType { get; set; } = string.Empty; // Sale, Restock, Adjustment, Return
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}