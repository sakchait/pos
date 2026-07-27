using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.HasKey(c => c.Code);

        builder.HasData(
            new Coupon
            {
                Code = "WELCOME10",
                Description = "10% Welcome Discount",
                DiscountType = "Percentage",
                DiscountValue = 10m,
                MinOrderAmount = 20.0m,
                MaxDiscountAmount = 15.0m,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                UsageLimit = 1000,
                UsedCount = 42,
                IsActive = true,
                ApplicableProductIdsJson = "[]",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Coupon
            {
                Code = "FLASH5",
                Description = "$5 off on order above $30",
                DiscountType = "Fixed",
                DiscountValue = 5.0m,
                MinOrderAmount = 30.0m,
                MaxDiscountAmount = 5.0m,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                UsageLimit = 500,
                UsedCount = 18,
                IsActive = true,
                ApplicableProductIdsJson = "[]",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Coupon
            {
                Code = "VIPBURGER",
                Description = "20% off on Burger combos",
                DiscountType = "Percentage",
                DiscountValue = 20m,
                MinOrderAmount = 15.0m,
                MaxDiscountAmount = 10.0m,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                UsageLimit = 100,
                UsedCount = 5,
                IsActive = true,
                ApplicableProductIdsJson = "[]",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
