using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Constants;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class PosTerminalConfiguration : IEntityTypeConfiguration<PosTerminal>
{
    public void Configure(EntityTypeBuilder<PosTerminal> builder)
    {
        builder.HasKey(t => t.Id);

        builder.HasIndex(t => new { t.BranchId, t.TerminalId }).IsUnique();

        builder.HasOne(t => t.Branch)
            .WithMany(b => b.PosTerminals)
            .HasForeignKey(t => t.BranchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasData(
            new PosTerminal
            {
                Id = Guid.Parse("c1111111-c111-c111-c111-c11111111111"),
                TerminalId = "N01",
                Name = "Head Office Terminal 1",
                BranchId = SystemGuids.Branches.HeadOffice
            },
            new PosTerminal
            {
                Id = Guid.Parse("c1111111-c111-c111-c111-c11111111112"),
                TerminalId = "N02",
                Name = "Head Office Terminal 2",
                BranchId = SystemGuids.Branches.HeadOffice
            },
            new PosTerminal
            {
                Id = Guid.Parse("c2222222-c222-c222-c222-c22222222221"),
                TerminalId = "N02",
                Name = "Siam Paragon Terminal 1",
                BranchId = Guid.Parse("a2222222-a222-a222-a222-a22222222222")
            },
            new PosTerminal
            {
                Id = Guid.Parse("c2222222-c222-c222-c222-c22222222222"),
                TerminalId = "N03",
                Name = "Siam Paragon Terminal 2",
                BranchId = Guid.Parse("a2222222-a222-a222-a222-a22222222222")
            }
        );
    }
}
