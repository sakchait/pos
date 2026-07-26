namespace Pos.Domain.Entities;

public class Role
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty; // Cashier, BranchManager, Accountant, Vendor, PurchaserManager, StockClerk
}

public class RoleRoutePermission
{
    public Guid Id { get; set; }
    public Guid RoleId { get; set; }
    public string RoutePath { get; set; } = string.Empty;
    public bool IsAllowed { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Role? Role { get; set; }
}

public class RoleChangeAuditLog
{
    public Guid Id { get; set; }
    public Guid TargetUserId { get; set; }
    public Guid OldRoleId { get; set; }
    public Guid NewRoleId { get; set; }
    public Guid ChangedByAdminId { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}