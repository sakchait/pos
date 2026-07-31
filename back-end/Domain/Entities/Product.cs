namespace Pos.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal StandardCost { get; set; }
    public int MinStockThreshold { get; set; } = 10;
    public bool IsVatInclusive { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public int Version { get; set; } = 1;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int StockQuantity { get; set; }

    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Description { get; set; } = string.Empty;
    public decimal Rating { get; set; } = 5.0m;
    public string ImageUrl { get; set; } = string.Empty;
    public string GalleryJson { get; set; } = "[]";
    public string SizesJson { get; set; } = "[]";
    public string ColorsJson { get; set; } = "[]";
    public decimal DiscountPercentage { get; set; } = 0m;
    public decimal DiscountAmount { get; set; } = 0m;
    public string DressStyle { get; set; } = string.Empty;
}
