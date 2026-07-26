namespace Pos.Domain.Entities;

public class Coupon
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Fixed"; // Fixed, Percentage
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; } = 0;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? ApplicableProductIdsJson { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
