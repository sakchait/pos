namespace Pos.Domain.Entities;

public class SystemAuditLog
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string HmacSignature { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}