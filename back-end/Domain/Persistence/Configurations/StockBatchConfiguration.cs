using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class StockBatchConfiguration : IEntityTypeConfiguration<StockBatch>
{
    public void Configure(EntityTypeBuilder<StockBatch> builder)
    {
        builder.HasData(
            new StockBatch
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777701"),
                WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111102"), // Signature Burger
                PurchaseOrderId = Guid.Empty,
                BatchNumber = "BATCH-INITIAL-01",
                UnitCost = 6.50m,
                InitialQuantity = 50,
                RemainingQuantity = 42,
                ReceivedDate = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                ExpiryDate = new DateTime(2027, 7, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
