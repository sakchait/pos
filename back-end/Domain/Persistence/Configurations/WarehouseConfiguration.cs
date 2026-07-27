using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.HasData(
            new Warehouse
            {
                Id = Guid.Parse("b1111111-b111-b111-b111-b11111111111"),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                Name = "Main Warehouse",
                IsMainWarehouse = true
            }
        );
    }
}
