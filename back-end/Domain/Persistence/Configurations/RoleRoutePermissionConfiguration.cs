using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class RoleRoutePermissionConfiguration : IEntityTypeConfiguration<RoleRoutePermission>
{
    public void Configure(EntityTypeBuilder<RoleRoutePermission> builder)
    {
        builder.HasData(
            // Cashier
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111101"), RoleId = new Guid("22222222-2222-2222-2222-222222222222"), RoutePath = "/pos", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111102"), RoleId = new Guid("22222222-2222-2222-2222-222222222222"), RoutePath = "/shifts", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111103"), RoleId = new Guid("22222222-2222-2222-2222-222222222222"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // BranchManager
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111104"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/pos", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111105"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/shifts", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111106"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/reports", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111107"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Accountant
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111108"), RoleId = new Guid("44444444-4444-4444-4444-444444444444"), RoutePath = "/reports", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111109"), RoleId = new Guid("44444444-4444-4444-4444-444444444444"), RoutePath = "/vendor", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111110"), RoleId = new Guid("44444444-4444-4444-4444-444444444444"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Vendor
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111111"), RoleId = new Guid("55555555-5555-5555-5555-555555555555"), RoutePath = "/vendor", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111112"), RoleId = new Guid("55555555-5555-5555-5555-555555555555"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // PurchaserManager
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111113"), RoleId = new Guid("66666666-6666-6666-6666-666666666666"), RoutePath = "/vendor", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111114"), RoleId = new Guid("66666666-6666-6666-6666-666666666666"), RoutePath = "/inventory", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111115"), RoleId = new Guid("66666666-6666-6666-6666-666666666666"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // StockClerk
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111116"), RoleId = new Guid("77777777-7777-7777-7777-777777777777"), RoutePath = "/inventory", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111117"), RoleId = new Guid("77777777-7777-7777-7777-777777777777"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

            // Admin
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111123"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/admin/roles", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111127"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/admin/audit-logs", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111128"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/admin/users", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111129"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/admin/products", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111130"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/admin/categories", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111124"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/profile", IsAllowed = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
