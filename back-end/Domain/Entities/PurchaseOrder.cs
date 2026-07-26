namespace Pos.Domain.Entities;

public class PurchaseOrder
{
    public Guid Id { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public Guid VendorId { get; set; }
    public Guid WarehouseId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Proposed"; // Proposed, Approved, Received, Rejected
    public bool ProposedByVendor { get; set; } = true;
    public Guid? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Vendor? Vendor { get; set; }
    public Warehouse? Warehouse { get; set; }
    public List<PurchaseOrderItem> Items { get; set; } = new();
}

public class PurchaseOrderItem
{
    public Guid Id { get; set; }
    public Guid PurchaseOrderId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal SubTotal { get; set; }

    public Product? Product { get; set; }
}