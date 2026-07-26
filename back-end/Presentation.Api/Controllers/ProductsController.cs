using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;

namespace Pos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IRepository<Product> _productsRepo;

    public ProductsController(IRepository<Product> productsRepo)
    {
        _productsRepo = productsRepo;
    }

    // 1. GET /api/products - Retrieves all products mapped to frontend Product structure
    [HttpGet]
    public async Task<IActionResult> GetProducts(CancellationToken cancellationToken)
    {
        var list = await _productsRepo.GetAll().AsNoTracking().ToListAsync(cancellationToken);
        
        var result = list.Select(p => new
        {
            id = p.Id.ToString(),
            sku = p.Code,
            name = p.Name,
            price = p.Price,
            category = GetDefaultCategory(p.Code),
            stock = p.StockQuantity,
            minStockThreshold = p.MinStockThreshold,
            imageUrl = GetDefaultImageUrl(p.Code),
            isAvailable = p.IsActive
        }).ToList();

        return Ok(result);
    }

    // 2. PUT /api/products/{id} - Updates product details (e.g., inventory levels)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] System.Text.Json.JsonElement updates, CancellationToken cancellationToken)
    {
        var product = await _productsRepo.GetAll().FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        if (updates.TryGetProperty("name", out var nameProp))
            product.Name = nameProp.GetString() ?? "";

        if (updates.TryGetProperty("price", out var priceProp))
            product.Price = priceProp.GetDecimal();

        if (updates.TryGetProperty("stock", out var stockProp))
            product.StockQuantity = stockProp.GetInt32();

        if (updates.TryGetProperty("minStockThreshold", out var thresholdProp))
            product.MinStockThreshold = thresholdProp.GetInt32();

        if (updates.TryGetProperty("isAvailable", out var availableProp))
            product.IsActive = availableProp.GetBoolean();

        product.UpdatedAt = DateTime.UtcNow;
        product.Version += 1;

        await _productsRepo.UpdateAsync(product);

        return Ok(new { message = "Product updated successfully." });
    }

    private static string GetDefaultCategory(string code)
    {
        return code switch
        {
            "0012" => "Appetizers",
            "0054" => "Main Course",
            "0098" => "Beverages",
            "0112" => "Desserts",
            "0087" => "Main Course",
            "0041" => "Appetizers",
            "0203" => "Beverages",
            "0319" => "Main Course",
            _ => "General"
        };
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
