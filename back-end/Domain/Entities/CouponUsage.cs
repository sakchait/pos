namespace Pos.Domain.Entities;

public class CouponUsage
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string CouponCode { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}
