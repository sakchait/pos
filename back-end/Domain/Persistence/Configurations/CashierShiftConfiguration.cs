using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class CashierShiftConfiguration : IEntityTypeConfiguration<CashierShift>
{
    public void Configure(EntityTypeBuilder<CashierShift> builder)
    {
        builder.HasData(
            new CashierShift
            {
                Id = Guid.Parse("ee111111-1111-1111-1111-111111111101"),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                PosTerminalId = "term-1",
                CashierId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                OpenedAt = new DateTime(2026, 7, 25, 6, 0, 0, DateTimeKind.Utc),
                ClosedAt = new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc),
                OpeningCash = 100.00m,
                TotalSystemCashSales = 350.00m,
                TotalCashPaidIn = 0.00m,
                TotalCashPaidOut = 0.00m,
                ExpectedCash = 450.00m,
                ActualCashCounted = 450.00m,
                CashDifference = 0.00m,
                Status = "Closed"
            },
            new CashierShift
            {
                Id = Guid.Parse("ee111111-1111-1111-1111-111111111102"),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                PosTerminalId = "term-1",
                CashierId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                OpenedAt = new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc),
                ClosedAt = null,
                OpeningCash = 100.00m,
                TotalSystemCashSales = 120.00m,
                TotalCashPaidIn = 0.00m,
                TotalCashPaidOut = 0.00m,
                ExpectedCash = 220.00m,
                ActualCashCounted = null,
                CashDifference = null,
                Status = "Open"
            }
        );
    }
}
