using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.HasIndex(v => v.TaxId).IsUnique();

        builder.HasData(
            new Vendor
            {
                Id = Guid.Parse("d1111111-d111-d111-d111-d11111111111"),
                TaxId = "0105551234599",
                Name = "Global Foods Co.",
                ContactPerson = "Jane Smith",
                Email = "vendor@globalfoods.com",
                Phone = "0819876543",
                IsActive = true
            }
        );
    }
}
