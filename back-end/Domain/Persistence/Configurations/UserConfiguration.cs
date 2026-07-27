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
                PasswordHash = "$2a$11$8q3/p6K0iA1Xv0vG0mJ5.u8A9d1E3f5G7h9i1J3k5L7m9N1O3P5Q6", // Hash for Admin@1234
                PinHash = "$2a$11$HjJ4K5vA3k9L9D/s8r5E6uOumS9h1R2D3y5G7h9i1J3k5L7m9N1O3P", // Hash for 9999
                FullName = "System Administrator",
                RoleId = SystemGuids.Roles.Admin,
                IsAdmin = true,
                IsActive = true,
                HourlyRate = 50.00m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333334"),
                Username = "sarah.jenkins",
                PasswordHash = "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", // Hash for password123
                PinHash = "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", // Hash for 1234
                FullName = "Sarah Jenkins",
                RoleId = SystemGuids.Roles.BranchManager,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                HourlyRate = 25.00m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
                Username = "alex.rivera",
                PasswordHash = "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", // Hash for password123
                PinHash = "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", // Hash for 1234
                FullName = "Alex Rivera",
                RoleId = SystemGuids.Roles.Cashier,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                HourlyRate = 18.00m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333303"),
                Username = "mark.tanaka",
                PasswordHash = "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", // Hash for password123
                PinHash = "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", // Hash for 1234
                FullName = "Mark Tanaka",
                RoleId = SystemGuids.Roles.StockClerk,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                HourlyRate = 20.00m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333304"),
                Username = "purchaser.admin",
                PasswordHash = "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", // Hash for password123
                PinHash = "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", // Hash for 1234
                FullName = "Elena Rostova",
                RoleId = SystemGuids.Roles.PurchaserManager,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                HourlyRate = 22.00m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
