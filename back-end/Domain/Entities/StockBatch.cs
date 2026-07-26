namespace Pos.Domain.Entities;

public class StockBatch
{
    public Guid Id { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid ProductId { get; set; }
    public Guid PurchaseOrderId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public int InitialQuantity { get; set; }
    public int RemainingQuantity { get; set; }
    public DateTime ReceivedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }

    public Product? Product { get; set; }
    public Warehouse? Warehouse { get; set; }
}