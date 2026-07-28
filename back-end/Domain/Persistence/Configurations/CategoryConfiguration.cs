using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasIndex(c => c.Code).IsUnique();

        builder.HasData(
            new Category
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222201"),
                Name = "Appetizers",
                Code = "APP",
                IsActive = true
            },
            new Category
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222202"),
                Name = "Main Course",
                Code = "MAIN",
                IsActive = true
            },
            new Category
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222203"),
                Name = "Beverages",
                Code = "BEV",
                IsActive = true
            },
            new Category
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222204"),
                Name = "Desserts",
                Code = "DES",
                IsActive = true
            }
        );
    }
}
