namespace Pos.Domain.Entities;

public class Member
{
    public Guid Id { get; set; }
    public string MemberNo { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int PointsBalance { get; set; } = 0;
    public decimal TotalSpent { get; set; } = 0;
    public string TierLevel { get; set; } = "Standard";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
