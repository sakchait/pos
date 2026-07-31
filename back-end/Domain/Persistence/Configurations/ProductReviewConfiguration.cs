using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.HasIndex(r => r.ProductId);

        builder.HasOne(r => r.Product)
            .WithMany()
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasData(
            new ProductReview
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333001"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111201"), // T-shirt with Tape Details
                CustomerName = "Alex K.",
                Rating = 5,
                Content = "Finding clothes that align with my personal style used to be a challenge until I discovered this. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
                CreatedAt = new DateTime(2023, 8, 14, 12, 0, 0, DateTimeKind.Utc)
            },
            new ProductReview
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333002"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111202"), // Skinny Fit Jeans
                CustomerName = "Sarah M.",
                Rating = 4,
                Content = "I'm blown away by the quality and style of the clothes I received. Every piece I've bought has exceeded my expectations.",
                CreatedAt = new DateTime(2023, 8, 15, 14, 30, 0, DateTimeKind.Utc)
            },
            new ProductReview
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333003"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111203"), // Checkered Shirt
                CustomerName = "Ethan R.",
                Rating = 5,
                Content = "This shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect.",
                CreatedAt = new DateTime(2023, 8, 16, 9, 15, 0, DateTimeKind.Utc)
            }
        );
    }
}
