namespace Pos.Domain.Entities;

public class WarehouseInventory
{
    public Guid WarehouseId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }

    public Warehouse? Warehouse { get; set; }
    public Product? Product { get; set; }
}
