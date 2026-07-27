using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class ShiftSwapRequestConfiguration : IEntityTypeConfiguration<ShiftSwapRequest>
{
    public void Configure(EntityTypeBuilder<ShiftSwapRequest> builder)
    {
        builder.HasOne(sr => sr.RequestorShift)
            .WithMany()
            .HasForeignKey(sr => sr.RequestorShiftId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new ShiftSwapRequest
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555501"),
                RequestorShiftId = Guid.Parse("44444444-4444-4444-4444-444444444401"),
                TargetUserId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                Reason = "Family emergency",
                Status = "PendingPeer",
                CreatedAt = new DateTime(2026, 7, 25, 10, 30, 0, DateTimeKind.Utc)
            }
        );
    }
}
