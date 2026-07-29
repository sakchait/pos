using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly IRepository<MemberPromotion> _promosRepo;

    public PromotionsController(IRepository<MemberPromotion> promosRepo)
    {
        _promosRepo = promosRepo;
    }

    // 1. GET /api/promotions - Get active member promotions
    [HttpGet]
    public async Task<IActionResult> GetActivePromotions(CancellationToken cancellationToken)
    {
        var now = System.DateTime.UtcNow;
        var list = await _promosRepo.GetAll()
            .AsNoTracking()
            .Where(p => p.IsActive && p.StartDate <= now && p.EndDate >= now)
            .Select(p => new
            {
                id = p.Id.ToString(),
                name = p.Name,
                promotionType = p.PromotionType,
                minSpentAmount = (double)p.MinSpentAmount,
                minQuantity = p.MinQuantity,
                discountAmount = (double)p.DiscountAmount,
                freeProductId = p.FreeProductId != null ? p.FreeProductId.ToString() : null,
                freeQuantity = p.FreeQuantity,
                startDate = p.StartDate.ToString("yyyy-MM-dd"),
                endDate = p.EndDate.ToString("yyyy-MM-dd"),
                isActive = p.IsActive
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }
}
