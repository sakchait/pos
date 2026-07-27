using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.HasIndex(po => po.PoNumber).IsUnique();

        builder.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.PurchaseOrderId);

        builder.HasData(
            new PurchaseOrder
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666601"),
                PoNumber = "PO-20260725-01",
                VendorId = Guid.Parse("d1111111-d111-d111-d111-d11111111111"),
                WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"),
                TotalAmount = 54.00m,
                Status = "Proposed",
                ProposedByVendor = true,
                CreatedAt = new DateTime(2026, 7, 25, 8, 30, 0, DateTimeKind.Utc)
            }
        );
    }
}
