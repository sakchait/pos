namespace Pos.Domain.Entities;

public class MemberAiRecommendation
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public Guid RecommendedProductId { get; set; }
    public string RecommendationReason { get; set; } = string.Empty;
    public decimal DiscountOfferPercent { get; set; } = 0;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Member? Member { get; set; }
    public Product? RecommendedProduct { get; set; }
}