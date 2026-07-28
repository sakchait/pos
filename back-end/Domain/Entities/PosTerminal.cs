using System;

namespace Pos.Domain.Entities;

public class PosTerminal
{
    public Guid Id { get; set; }
    public string TerminalId { get; set; } = string.Empty; // e.g. "N02"
    public string Name { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
}
