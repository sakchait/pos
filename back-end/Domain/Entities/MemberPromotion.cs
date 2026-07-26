namespace Pos.Domain.Entities;

public class MemberPromotion
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PromotionType { get; set; } = "MinSpentDiscount"; // MinSpentDiscount, BuyXGetY
    public decimal MinSpentAmount { get; set; } = 0;
    public int MinQuantity { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public Guid? FreeProductId { get; set; }
    public int FreeQuantity { get; set; } = 0;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public Product? FreeProduct { get; set; }
}
