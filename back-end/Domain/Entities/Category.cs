using System;
using System.Collections.Generic;

namespace Pos.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public List<Product> Products { get; set; } = new();
}
