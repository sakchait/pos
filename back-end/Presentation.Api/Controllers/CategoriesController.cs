using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IRepository<Category> _categoriesRepo;

    public CategoriesController(IRepository<Category> categoriesRepo)
    {
        _categoriesRepo = categoriesRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
    {
        var query = _categoriesRepo.GetAll()
            .AsNoTracking()
            .Where(c => c.IsActive);

        if (page.HasValue && pageSize.HasValue)
        {
            var totalCount = await query.CountAsync(cancellationToken);
            var list = await query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .ToListAsync(cancellationToken);

            var items = list.Select(c => new
            {
                id = c.Id.ToString(),
                name = c.Name,
                code = c.Code
            }).ToList();

            return Ok(new Pos.Application.DTOs.PaginatedResult<object>
            {
                Items = items.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = page.Value,
                PageSize = pageSize.Value
            });
        }
        else
        {
            var list = await query.ToListAsync(cancellationToken);
            var result = list.Select(c => new
            {
                id = c.Id.ToString(),
                name = c.Name,
                code = c.Code
            }).ToList();

            return Ok(result);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest("Name and Code are required.");
        }

        var existing = await _categoriesRepo.GetAll()
            .AnyAsync(c => c.Code.ToLower() == request.Code.ToLower() && c.IsActive, cancellationToken);
        if (existing)
        {
            return BadRequest($"Category with code '{request.Code}' already exists.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            IsActive = true
        };

        await _categoriesRepo.AddAsync(category);
        await _categoriesRepo.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Category created successfully.", id = category.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryRequestDto request, CancellationToken cancellationToken)
    {
        var category = await _categoriesRepo.FindAsync(id);
        if (category == null || !category.IsActive)
        {
            return NotFound("Category not found.");
        }

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            category.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            // Check uniqueness if code is changed
            if (category.Code.ToLower() != request.Code.ToLower())
            {
                var existing = await _categoriesRepo.GetAll()
                    .AnyAsync(c => c.Code.ToLower() == request.Code.ToLower() && c.IsActive, cancellationToken);
                if (existing)
                {
                    return BadRequest($"Category with code '{request.Code}' already exists.");
                }
                category.Code = request.Code;
            }
        }

        await _categoriesRepo.SaveChangesAsync(cancellationToken);
        return Ok(new { message = "Category updated successfully." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken)
    {
        var category = await _categoriesRepo.FindAsync(id);
        if (category == null)
        {
            return NotFound("Category not found.");
        }

        // Soft delete
        category.IsActive = false;
        await _categoriesRepo.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Category deleted successfully." });
    }
}

public class CategoryRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
