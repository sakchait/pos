using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;

namespace Pos.Domain.Persistence.Configurations;

public class ProductAssociationConfiguration : IEntityTypeConfiguration<ProductAssociation>
{
    public void Configure(EntityTypeBuilder<ProductAssociation> builder)
    {
        builder.HasOne(pa => pa.PrimaryProduct)
            .WithMany()
            .HasForeignKey(pa => pa.PrimaryProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pa => pa.RecommendedProduct)
            .WithMany()
            .HasForeignKey(pa => pa.RecommendedProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
