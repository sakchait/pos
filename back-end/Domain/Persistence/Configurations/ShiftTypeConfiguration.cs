using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class ShiftTypeConfiguration : IEntityTypeConfiguration<ShiftType>
{
    public void Configure(EntityTypeBuilder<ShiftType> builder)
    {
        builder.HasData(
            new ShiftType { Id = 1, Name = "กะเช้า", StartTime = new TimeSpan(6, 0, 0), EndTime = new TimeSpan(14, 0, 0) },
            new ShiftType { Id = 2, Name = "กะบ่าย", StartTime = new TimeSpan(14, 0, 0), EndTime = new TimeSpan(22, 0, 0) },
            new ShiftType { Id = 3, Name = "กะดึก", StartTime = new TimeSpan(22, 0, 0), EndTime = new TimeSpan(6, 0, 0) }
        );
    }
}
