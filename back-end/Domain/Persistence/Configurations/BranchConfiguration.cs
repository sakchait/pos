using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Constants;
using Pos.Domain.Entities;

namespace Pos.Domain.Persistence.Configurations;

public class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.HasIndex(b => b.Code).IsUnique();

        builder.HasData(
            new Branch
            {
                Id = SystemGuids.Branches.HeadOffice,
                Code = "BR001",
                Name = "Head Office Branch",
                Address = "123 Main Street, Bangkok"
            }
        );
    }
}
