namespace Pos.Domain.Entities;

public class Vendor
{
    public Guid Id { get; set; }
    public string TaxId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ContactPerson { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
}
