namespace Pos.Domain.Entities;

public class ProductAssociation
{
    public Guid Id { get; set; }
    public Guid PrimaryProductId { get; set; }
    public Guid RecommendedProductId { get; set; }
    public decimal ConfidenceScore { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Product? PrimaryProduct { get; set; }
    public Product? RecommendedProduct { get; set; }
}
