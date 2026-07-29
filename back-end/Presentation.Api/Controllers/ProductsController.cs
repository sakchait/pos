using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IRepository<Product> _productsRepo;
    private readonly IRepository<Category> _categoriesRepo;

    public ProductsController(IRepository<Product> productsRepo, IRepository<Category> categoriesRepo)
    {
        _productsRepo = productsRepo;
        _categoriesRepo = categoriesRepo;
    }

    // 1. GET /api/products - Retrieves all products
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
    {
        var query = _productsRepo.GetAll()
            .Include(p => p.Category)
            .AsNoTracking();

        if (page.HasValue && pageSize.HasValue)
        {
            var totalCount = await query.CountAsync(cancellationToken);
            var list = await query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .ToListAsync(cancellationToken);

            var items = list.Select(p => new
            {
                id = p.Id.ToString(),
                sku = p.Code,
                name = p.Name,
                price = p.Price,
                category = p.Category != null ? p.Category.Name : "General",
                stock = p.StockQuantity,
                minStockThreshold = p.MinStockThreshold,
                imageUrl = GetDefaultImageUrl(p.Code),
                isAvailable = p.IsActive
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
            var result = list.Select(p => new
            {
                id = p.Id.ToString(),
                sku = p.Code,
                name = p.Name,
                price = p.Price,
                category = p.Category != null ? p.Category.Name : "General",
                stock = p.StockQuantity,
                minStockThreshold = p.MinStockThreshold,
                imageUrl = GetDefaultImageUrl(p.Code),
                isAvailable = p.IsActive
            }).ToList();

            return Ok(result);
        }
    }

    // 2. POST /api/products - Creates a new product
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Sku) || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Sku and Name are required." });

        var existing = await _productsRepo.GetAll().AnyAsync(p => p.Code.ToLower() == dto.Sku.ToLower(), cancellationToken);
        if (existing)
            return BadRequest(new { message = $"Product with SKU '{dto.Sku}' already exists." });

        var category = await _categoriesRepo.GetAll()
            .FirstOrDefaultAsync(c => c.Name.ToLower() == dto.Category.ToLower() && c.IsActive, cancellationToken);

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Code = dto.Sku,
            Name = dto.Name,
            Price = dto.Price,
            StockQuantity = dto.Stock,
            MinStockThreshold = dto.MinStockThreshold,
            CategoryId = category?.Id,
            IsActive = true,
            Version = 1,
            UpdatedAt = DateTime.UtcNow
        };

        await _productsRepo.AddAsync(product);
        await _productsRepo.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Product created successfully.", id = product.Id });
    }

    // 3. PUT /api/products/{id} - Updates product details
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] System.Text.Json.JsonElement updates, CancellationToken cancellationToken)
    {
        var product = await _productsRepo.GetAll().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        if (updates.TryGetProperty("name", out var nameProp) && nameProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            product.Name = nameProp.GetString() ?? "";

        if (updates.TryGetProperty("sku", out var skuProp) && skuProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            product.Code = skuProp.GetString() ?? "";

        if (updates.TryGetProperty("price", out var priceProp) && priceProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            product.Price = priceProp.GetDecimal();

        if (updates.TryGetProperty("stock", out var stockProp) && stockProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            product.StockQuantity = stockProp.GetInt32();

        if (updates.TryGetProperty("minStockThreshold", out var thresholdProp) && thresholdProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            product.MinStockThreshold = thresholdProp.GetInt32();

        if (updates.TryGetProperty("isAvailable", out var availableProp) && availableProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            product.IsActive = availableProp.GetBoolean();

        if (updates.TryGetProperty("category", out var categoryProp) && categoryProp.ValueKind != System.Text.Json.JsonValueKind.Null)
        {
            var categoryName = categoryProp.GetString() ?? "";
            var category = await _categoriesRepo.GetAll()
                .FirstOrDefaultAsync(c => c.Name.ToLower() == categoryName.ToLower() && c.IsActive, cancellationToken);
            product.CategoryId = category?.Id;
        }

        product.UpdatedAt = DateTime.UtcNow;
        product.Version += 1;

        await _productsRepo.UpdateAsync(product);
        await _productsRepo.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Product updated successfully." });
    }

    // 4. DELETE /api/products/{id} - Soft deletes a product
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken cancellationToken)
    {
        var product = await _productsRepo.GetAll().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product == null)
            return NotFound(new { message = "Product not found." });

        product.IsActive = false;
        await _productsRepo.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Product deleted successfully." });
    }

    private static string GetDefaultImageUrl(string code)
    {
        return code switch
        {
            "0012" => "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80",
            "0054" => "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
            "0098" => "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80",
            "0112" => "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80",
            "0087" => "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80",
            "0041" => "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80",
            "0203" => "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80",
            "0319" => "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
            _ => ""
        };
    }
}

public class CreateProductDto
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int MinStockThreshold { get; set; } = 10;
    public string Category { get; set; } = string.Empty;
}
