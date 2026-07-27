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
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111101"), RoleId = new Guid("22222222-2222-2222-2222-222222222222"), RoutePath = "/pos", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111102"), RoleId = new Guid("22222222-2222-2222-2222-222222222222"), RoutePath = "/shifts", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111103"), RoleId = new Guid("22222222-2222-2222-2222-222222222222"), RoutePath = "/profile", IsAllowed = true },

            // BranchManager
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111104"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/pos", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111105"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/shifts", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111106"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/reports", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111107"), RoleId = new Guid("33333333-3333-3333-3333-333333333333"), RoutePath = "/profile", IsAllowed = true },

            // Accountant
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111108"), RoleId = new Guid("44444444-4444-4444-4444-444444444444"), RoutePath = "/reports", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111109"), RoleId = new Guid("44444444-4444-4444-4444-444444444444"), RoutePath = "/vendor", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111110"), RoleId = new Guid("44444444-4444-4444-4444-444444444444"), RoutePath = "/profile", IsAllowed = true },

            // Vendor
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111111"), RoleId = new Guid("55555555-5555-5555-5555-555555555555"), RoutePath = "/vendor", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111112"), RoleId = new Guid("55555555-5555-5555-5555-555555555555"), RoutePath = "/profile", IsAllowed = true },

            // PurchaserManager
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111113"), RoleId = new Guid("66666666-6666-6666-6666-666666666666"), RoutePath = "/vendor", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111114"), RoleId = new Guid("66666666-6666-6666-6666-666666666666"), RoutePath = "/inventory", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111115"), RoleId = new Guid("66666666-6666-6666-6666-666666666666"), RoutePath = "/profile", IsAllowed = true },

            // StockClerk
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111116"), RoleId = new Guid("77777777-7777-7777-7777-777777777777"), RoutePath = "/inventory", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111117"), RoleId = new Guid("77777777-7777-7777-7777-777777777777"), RoutePath = "/profile", IsAllowed = true },

            // Admin
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111118"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/pos", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111119"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/shifts", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111120"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/shifts/schedule", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111121"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/vendor", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111122"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/reports", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111123"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/admin/roles", IsAllowed = true },
            new RoleRoutePermission { Id = Guid.Parse("aa111111-1111-1111-1111-111111111124"), RoleId = new Guid("11111111-1111-1111-1111-111111111111"), RoutePath = "/profile", IsAllowed = true }
        );
    }
}
