using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class DrawerOpenLogConfiguration : IEntityTypeConfiguration<DrawerOpenLog>
{
    public void Configure(EntityTypeBuilder<DrawerOpenLog> builder)
    {
        builder.HasData(
            new DrawerOpenLog
            {
                Id = Guid.Parse("cc111111-1111-1111-1111-111111111101"),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                PosTerminalId = "term-1",
                ShiftId = Guid.Parse("44444444-4444-4444-4444-444444444401"),
                CashierId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                ApprovedBy = Guid.Parse("33333333-3333-3333-3333-333333333302"), // Alex Rivera (Manager)
                Reason = "NO_SALE",
                OpenedAt = new DateTime(2026, 7, 25, 9, 30, 0, DateTimeKind.Utc)
            },
            new DrawerOpenLog
            {
                Id = Guid.Parse("cc111111-1111-1111-1111-111111111102"),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                PosTerminalId = "term-1",
                ShiftId = Guid.Parse("44444444-4444-4444-4444-444444444403"),
                CashierId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                ApprovedBy = null,
                Reason = "MANUAL_OPEN",
                OpenedAt = new DateTime(2026, 7, 25, 15, 45, 0, DateTimeKind.Utc)
            }
        );
    }
}
