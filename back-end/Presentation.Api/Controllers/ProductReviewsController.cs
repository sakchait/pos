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
[Route("api/products/{productId}/reviews")]
public class ProductReviewsController : ControllerBase
{
    private readonly IRepository<ProductReview> _reviewsRepo;
    private readonly IRepository<Product> _productsRepo;

    public ProductReviewsController(IRepository<ProductReview> reviewsRepo, IRepository<Product> productsRepo)
    {
        _reviewsRepo = reviewsRepo;
        _productsRepo = productsRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var productExists = await _productsRepo.GetAll().AnyAsync(p => p.Id == productId, cancellationToken);
        if (!productExists)
            return NotFound(new { message = "Product not found." });

        var query = _reviewsRepo.GetAll()
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        
        var list = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        // Calculate average rating
        var averageRating = totalCount > 0 
            ? Math.Round(await query.AverageAsync(r => (double)r.Rating, cancellationToken), 1) 
            : 5.0;

        var reviews = list.Select(r => new
        {
            id = r.Id.ToString(),
            user = r.CustomerName,
            content = r.Content,
            rating = r.Rating,
            date = r.CreatedAt.ToString("MMMM dd, yyyy")
        }).ToList();

        return Ok(new
        {
            averageRating = averageRating,
            totalReviewsCount = totalCount,
            reviews = reviews
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview(Guid productId, [FromBody] CreateReviewDto dto, CancellationToken cancellationToken)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        var product = await _productsRepo.GetAll().FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);
        if (product == null)
            return NotFound(new { message = "Product not found." });

        var review = new ProductReview
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            CustomerName = string.IsNullOrWhiteSpace(dto.CustomerName) ? "Guest" : dto.CustomerName,
            Rating = dto.Rating,
            Content = dto.Content ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewsRepo.AddAsync(review);
        
        // Recalculate average product rating
        var allReviews = await _reviewsRepo.GetAll().Where(r => r.ProductId == productId).ToListAsync(cancellationToken);
        allReviews.Add(review);
        var averageRating = Math.Round((decimal)allReviews.Average(r => r.Rating), 1);
        product.Rating = averageRating;
        await _productsRepo.UpdateAsync(product);

        await _reviewsRepo.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Review added successfully.", id = review.Id });
    }
}

public class CreateReviewDto
{
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Content { get; set; } = string.Empty;
}
