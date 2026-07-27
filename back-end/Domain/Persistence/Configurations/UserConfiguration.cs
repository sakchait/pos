using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Constants;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasIndex(u => u.Username).IsUnique();

        builder.HasData(
            new User
            {
                Id = SystemGuids.Users.SystemAdmin,
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"), // Default Admin Password
                PinHash = BCrypt.Net.BCrypt.HashPassword("9999"),
                FullName = "System Administrator",
                RoleId = SystemGuids.Roles.Admin,
                IsAdmin = true,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333334"),
                Username = "sarah.jenkins",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Sarah Jenkins",
                RoleId = SystemGuids.Roles.BranchManager,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
                Username = "alex.rivera",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Alex Rivera",
                RoleId = SystemGuids.Roles.Cashier,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333303"),
                Username = "mark.tanaka",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Mark Tanaka",
                RoleId = SystemGuids.Roles.StockClerk,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333304"),
                Username = "purchaser.admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Elena Rostova",
                RoleId = SystemGuids.Roles.PurchaserManager,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
