using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class ShiftScheduleConfiguration : IEntityTypeConfiguration<ShiftSchedule>
{
    public void Configure(EntityTypeBuilder<ShiftSchedule> builder)
    {
        builder.HasData(
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444401"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 1, // Morning
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "Cashier"
            },
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444402"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333302"), // Alex Rivera
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 1, // Morning
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "BranchManager"
            },
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444403"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 2, // Afternoon
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "Cashier"
            },
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444404"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333304"), // Elena Rostova
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 3, // Night
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "Cashier"
            }
        );
    }
}
