using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.HasData(
            new Attendance
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888801"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                ClockIn = new DateTime(2026, 7, 25, 6, 8, 0, DateTimeKind.Utc),
                ClockOut = new DateTime(2026, 7, 25, 14, 2, 0, DateTimeKind.Utc)
            },
            new Attendance
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888802"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                ClockIn = new DateTime(2026, 7, 25, 14, 14, 0, DateTimeKind.Utc),
                ClockOut = new DateTime(2026, 7, 25, 22, 5, 0, DateTimeKind.Utc)
            },
            new Attendance
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888803"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333302"), // Alex Rivera
                ClockIn = new DateTime(2026, 7, 25, 5, 54, 0, DateTimeKind.Utc),
                ClockOut = new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
