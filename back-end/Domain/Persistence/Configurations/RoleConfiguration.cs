using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Constants;
using Pos.Domain.Entities;

namespace Pos.Domain.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasData(
            new Role { Id = SystemGuids.Roles.Admin, Name = "Admin" },
            new Role { Id = SystemGuids.Roles.Cashier, Name = "Cashier" },
            new Role { Id = SystemGuids.Roles.BranchManager, Name = "BranchManager" },
            new Role { Id = SystemGuids.Roles.Accountant, Name = "Accountant" },
            new Role { Id = SystemGuids.Roles.Vendor, Name = "Vendor" },
            new Role { Id = SystemGuids.Roles.PurchaserManager, Name = "PurchaserManager" },
            new Role { Id = SystemGuids.Roles.StockClerk, Name = "StockClerk" }
        );
    }
}
