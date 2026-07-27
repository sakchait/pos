using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class PurchaseOrderItemConfiguration : IEntityTypeConfiguration<PurchaseOrderItem>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderItem> builder)
    {
        builder.HasData(
            new PurchaseOrderItem
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666602"),
                PurchaseOrderId = Guid.Parse("66666666-6666-6666-6666-666666666601"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111102"), // Signature Burger
                Quantity = 3,
                UnitPrice = 18.00m,
                SubTotal = 54.00m
            }
        );
    }
}
