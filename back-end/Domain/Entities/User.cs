namespace Pos.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public Guid RoleId { get; set; }
    public Guid? BranchId { get; set; }
    public Guid? VendorId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PinHash { get; set; }
    public decimal HourlyRate { get; set; } = 50.0m;
    public bool IsAdmin { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Role? Role { get; set; }
    public Branch? Branch { get; set; }
    public Vendor? Vendor { get; set; }
}
