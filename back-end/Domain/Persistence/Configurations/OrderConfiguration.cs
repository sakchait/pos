using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;

namespace Pos.Domain.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasIndex(o => o.OrderNo).IsUnique();
        builder.HasIndex(o => o.CreatedAt);
        builder.HasIndex(o => o.SyncStatus);

        builder.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.OrderId);
        builder.HasMany(e => e.Payments).WithOne().HasForeignKey(p => p.OrderId);
        builder.HasOne(e => e.CouponUsage).WithOne().HasForeignKey<CouponUsage>(c => c.OrderId);
        builder.HasOne(e => e.Member).WithMany().HasForeignKey(e => e.MemberId).OnDelete(DeleteBehavior.SetNull);
    }
}
