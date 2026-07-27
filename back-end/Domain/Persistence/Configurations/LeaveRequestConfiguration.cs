using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.HasData(
            new LeaveRequest
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999901"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333304"), // Elena Rostova
                LeaveType = "SickLeave",
                StartDate = new DateTime(2026, 7, 20, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 7, 21, 0, 0, 0, DateTimeKind.Utc),
                Reason = "High fever and flu",
                Status = "Approved"
            },
            new LeaveRequest
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999902"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                LeaveType = "AnnualLeave",
                StartDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 8, 5, 0, 0, 0, DateTimeKind.Utc),
                Reason = "Family vacation",
                Status = "Approved"
            }
        );
    }
}
