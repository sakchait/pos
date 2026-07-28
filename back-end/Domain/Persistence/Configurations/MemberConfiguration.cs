using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;

namespace Pos.Domain.Persistence.Configurations;

public class MemberConfiguration : IEntityTypeConfiguration<Member>
{
    public void Configure(EntityTypeBuilder<Member> builder)
    {
        builder.HasIndex(m => m.PhoneNumber).IsUnique();
        builder.HasIndex(m => m.MemberNo).IsUnique();

        builder.HasData(
            new Member
            {
                Id = Guid.Parse("d1111111-d111-d111-d111-d11111111111"),
                MemberNo = "M-1001",
                FullName = "Sarah Jenkins",
                PhoneNumber = "0812345678",
                Email = "sarah.j@example.com",
                PointsBalance = 540,
                TotalSpent = 1200.00m,
                TierLevel = "Gold",
                CreatedAt = new DateTime(2024, 3, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new Member
            {
                Id = Guid.Parse("d2222222-d222-d222-d222-d22222222222"),
                MemberNo = "M-1002",
                FullName = "Alex Rivera",
                PhoneNumber = "0898765432",
                Email = "alex.r@example.com",
                PointsBalance = 1250,
                TotalSpent = 4500.00m,
                TierLevel = "Platinum",
                CreatedAt = new DateTime(2023, 11, 20, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
