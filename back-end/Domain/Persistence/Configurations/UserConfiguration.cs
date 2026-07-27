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
                PasswordHash = "$2a$11$uC19S.8s3RpTb1hz7wKJouDpB766FnaRg500LzBhCb9rmVjsmSygu", // Hash for Admin@1234
                PinHash = "$2a$11$v.SpJbKinX0eR4gMp33utuzaMIvOIyPxJgyT78/e./y0kdFMQnrJS", // Hash for 9999
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
                PasswordHash = "$2a$11$lndSqgQXC5RexO5S6cxWIu8ffjLPpcNR7xQQq41y9aouMf584wm2u", // Hash for password123
                PinHash = "$2a$11$Xkgs2dzU4n/gjcB4Y/NU5OSVM5ws31xKLgi/6k9JdP/xV46V7I7NO", // Hash for 1234
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
                PasswordHash = "$2a$11$lndSqgQXC5RexO5S6cxWIu8ffjLPpcNR7xQQq41y9aouMf584wm2u", // Hash for password123
                PinHash = "$2a$11$Xkgs2dzU4n/gjcB4Y/NU5OSVM5ws31xKLgi/6k9JdP/xV46V7I7NO", // Hash for 1234
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
                PasswordHash = "$2a$11$lndSqgQXC5RexO5S6cxWIu8ffjLPpcNR7xQQq41y9aouMf584wm2u", // Hash for password123
                PinHash = "$2a$11$Xkgs2dzU4n/gjcB4Y/NU5OSVM5ws31xKLgi/6k9JdP/xV46V7I7NO", // Hash for 1234
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
                PasswordHash = "$2a$11$lndSqgQXC5RexO5S6cxWIu8ffjLPpcNR7xQQq41y9aouMf584wm2u", // Hash for password123
                PinHash = "$2a$11$Xkgs2dzU4n/gjcB4Y/NU5OSVM5ws31xKLgi/6k9JdP/xV46V7I7NO", // Hash for 1234
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
