using System;
using System.Collections.Generic;

namespace Pos.Domain.Entities;

public class Branch
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? TaxId { get; set; }

    public ICollection<PosTerminal> PosTerminals { get; set; } = new List<PosTerminal>();
}
