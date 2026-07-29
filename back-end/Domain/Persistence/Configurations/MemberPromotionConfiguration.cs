using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class MemberPromotionConfiguration : IEntityTypeConfiguration<MemberPromotion>
{
    public void Configure(EntityTypeBuilder<MemberPromotion> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasData(
            new MemberPromotion
            {
                Id = Guid.Parse("e1111111-e111-e111-e111-e11111111111"),
                Name = "Gold Member Welcome Discount",
                PromotionType = "MinSpentDiscount",
                MinSpentAmount = 100.00m,
                MinQuantity = 0,
                DiscountAmount = 10.00m,
                FreeProductId = null,
                FreeQuantity = 0,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true
            },
            new MemberPromotion
            {
                Id = Guid.Parse("e2222222-e222-e222-e222-e22222222222"),
                Name = "Latte Buy 2 Get 1 Free",
                PromotionType = "BuyXGetY",
                MinSpentAmount = 0.00m,
                MinQuantity = 2,
                DiscountAmount = 0.00m,
                FreeProductId = Guid.Parse("11111111-1111-1111-1111-111111111103"), // Artisan Latte
                FreeQuantity = 1,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                IsActive = true
            }
        );
    }
}
