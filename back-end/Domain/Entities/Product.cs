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
}
