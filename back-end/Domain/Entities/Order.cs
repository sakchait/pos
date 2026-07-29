namespace Pos.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid BranchId { get; set; }
    public Guid WarehouseId { get; set; }
    public Guid CashierId { get; set; }
    public Guid? MemberId { get; set; }
    public Guid ShiftId { get; set; }
    public string PosTerminalId { get; set; } = string.Empty;
    public string OrderNo { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal TotalItemDiscount { get; set; }
    public decimal CouponDiscount { get; set; }
    public decimal AmountBeforeVat { get; set; }
    public decimal VatAmount { get; set; }
    public decimal GrandTotal { get; set; }

    public string SyncStatus { get; set; } = "Synced"; // Pending, Synced, Conflict
    public string? HmacSignature { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();
    public List<OrderPayment> Payments { get; set; } = new();
    public CouponUsage? CouponUsage { get; set; }
    public Member? Member { get; set; }
    public string PaymentMethod { get; set; }
    public decimal TotalAmount { get; set; }
}

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal ItemDiscount { get; set; }
    public decimal SubTotal { get; set; } // Price before VAT 7%
    public decimal VatAmount { get; set; }

    public Product? Product { get; set; }
}

public class OrderPayment
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // Cash, CreditCard, PromptPayQR
    public decimal Amount { get; set; }
    public string? ReferenceNo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
