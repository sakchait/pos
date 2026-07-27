using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasIndex(p => p.Code).IsUnique();

        builder.HasData(
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111101"),
                Code = "0012",
                Name = "Mediterranean Salad",
                Price = 14.50m,
                StandardCost = 5.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 35
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111102"),
                Code = "0054",
                Name = "Signature Burger",
                Price = 18.00m,
                StandardCost = 6.50m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 42
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111103"),
                Code = "0098",
                Name = "Artisan Latte",
                Price = 5.25m,
                StandardCost = 1.50m,
                MinStockThreshold = 20,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 80
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111104"),
                Code = "0112",
                Name = "Glazed Donut",
                Price = 3.50m,
                StandardCost = 1.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 50
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111105"),
                Code = "0087",
                Name = "Mixed Grill",
                Price = 24.00m,
                StandardCost = 9.00m,
                MinStockThreshold = 8,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 3
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111106"),
                Code = "0041",
                Name = "Truffle Fries",
                Price = 8.50m,
                StandardCost = 2.50m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 65
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111107"),
                Code = "0203",
                Name = "Iced Matcha Latte",
                Price = 6.00m,
                StandardCost = 2.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 2
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111108"),
                Code = "0319",
                Name = "Ribeye Steak 300g",
                Price = 38.00m,
                StandardCost = 15.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 4
            }
        );
    }
}
