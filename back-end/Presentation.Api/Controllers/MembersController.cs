using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class MembersController : ControllerBase
{
    private readonly IRepository<Member> _membersRepo;

    public MembersController(IRepository<Member> membersRepo)
    {
        _membersRepo = membersRepo;
    }

    // 1. GET /api/members - Get all members
    [HttpGet]
    public async Task<IActionResult> GetMembers([FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken cancellationToken)
    {
        var query = _membersRepo.GetAll()
            .AsNoTracking()
            .OrderByDescending(m => m.CreatedAt);

        if (page.HasValue && pageSize.HasValue)
        {
            var totalCount = await query.CountAsync(cancellationToken);
            var list = await query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .ToListAsync(cancellationToken);

            var items = list.Select(m => new
            {
                id = m.Id.ToString(),
                memberNo = m.MemberNo,
                name = m.FullName,
                phone = m.PhoneNumber,
                email = m.Email,
                points = m.PointsBalance,
                totalSpent = (double)m.TotalSpent,
                tier = m.TierLevel,
                joinDate = m.CreatedAt.ToString("yyyy-MM-dd")
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
            var result = list.Select(m => new
            {
                id = m.Id.ToString(),
                memberNo = m.MemberNo,
                name = m.FullName,
                phone = m.PhoneNumber,
                email = m.Email,
                points = m.PointsBalance,
                totalSpent = (double)m.TotalSpent,
                tier = m.TierLevel,
                joinDate = m.CreatedAt.ToString("yyyy-MM-dd")
            }).ToList();

            return Ok(result);
        }
    }

    // 2. GET /api/members/{id} - Get single member
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMemberById(Guid id)
    {
        var m = await _membersRepo.FindAsync(id);
        if (m == null) return NotFound();

        return Ok(new
        {
            id = m.Id.ToString(),
            memberNo = m.MemberNo,
            name = m.FullName,
            phone = m.PhoneNumber,
            email = m.Email,
            points = m.PointsBalance,
            totalSpent = (double)m.TotalSpent,
            tier = m.TierLevel,
            joinDate = m.CreatedAt.ToString("yyyy-MM-dd")
        });
    }

    // 3. GET /api/members/search?q={query} - Search by phone or memberNo
    [HttpGet("search")]
    public async Task<IActionResult> SearchMembers([FromQuery] string q, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest(new { message = "Query parameter 'q' is required." });
        }

        var m = await _membersRepo.GetAll()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.PhoneNumber == q || x.MemberNo == q, cancellationToken);

        if (m == null) return Ok(null);

        return Ok(new
        {
            id = m.Id.ToString(),
            memberNo = m.MemberNo,
            name = m.FullName,
            phone = m.PhoneNumber,
            email = m.Email,
            points = m.PointsBalance,
            totalSpent = (double)m.TotalSpent,
            tier = m.TierLevel,
            joinDate = m.CreatedAt.ToString("yyyy-MM-dd")
        });
    }

    // 4. POST /api/members - Create member
    [HttpPost]
    public async Task<IActionResult> CreateMember([FromBody] CreateMemberDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Phone))
        {
            return BadRequest(new { message = "Name and Phone fields are required." });
        }

        // Phone number uniqueness check
        var phoneExists = await _membersRepo.GetAll()
            .AnyAsync(x => x.PhoneNumber == dto.Phone, cancellationToken);
        if (phoneExists)
        {
            return BadRequest(new { message = "A member with this phone number already exists." });
        }

        // Auto-generate MemberNo in the format M-XXXX
        var maxMemberNo = await _membersRepo.GetAll()
            .Where(m => m.MemberNo.StartsWith("M-"))
            .OrderByDescending(m => m.MemberNo)
            .Select(m => m.MemberNo)
            .FirstOrDefaultAsync(cancellationToken);

        int nextSequence = 1001;
        if (!string.IsNullOrEmpty(maxMemberNo) && maxMemberNo.Length > 2)
        {
            if (int.TryParse(maxMemberNo.Substring(2), out var currentSeq))
            {
                nextSequence = currentSeq + 1;
            }
        }
        string memberNo = $"M-{nextSequence}";

        var member = new Member
        {
            Id = Guid.NewGuid(),
            MemberNo = memberNo,
            FullName = dto.Name,
            PhoneNumber = dto.Phone,
            Email = dto.Email,
            PointsBalance = dto.Points,
            TotalSpent = dto.TotalSpent,
            TierLevel = string.IsNullOrWhiteSpace(dto.Tier) ? "Standard" : dto.Tier,
            CreatedAt = DateTime.UtcNow
        };

        await _membersRepo.AddAsync(member);

        return CreatedAtAction(nameof(GetMemberById), new { id = member.Id }, new
        {
            id = member.Id.ToString(),
            memberNo = member.MemberNo,
            name = member.FullName,
            phone = member.PhoneNumber,
            email = member.Email,
            points = member.PointsBalance,
            totalSpent = (double)member.TotalSpent,
            tier = member.TierLevel,
            joinDate = member.CreatedAt.ToString("yyyy-MM-dd")
        });
    }

    // 5. PUT /api/members/{id} - Update member
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMember(Guid id, [FromBody] UpdateMemberDto dto, CancellationToken cancellationToken)
    {
        var member = await _membersRepo.FindAsync(id);
        if (member == null) return NotFound();

        // Validate only if name/phone are provided
        if (dto.Name != null && string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { message = "Name cannot be empty." });
        }
        if (dto.Phone != null && string.IsNullOrWhiteSpace(dto.Phone))
        {
            return BadRequest(new { message = "Phone cannot be empty." });
        }

        // Phone number uniqueness check (excluding self)
        if (dto.Phone != null && dto.Phone != member.PhoneNumber)
        {
            var phoneExists = await _membersRepo.GetAll()
                .AnyAsync(x => x.PhoneNumber == dto.Phone && x.Id != id, cancellationToken);
            if (phoneExists)
            {
                return BadRequest(new { message = "A member with this phone number already exists." });
            }
            member.PhoneNumber = dto.Phone;
        }

        if (dto.Name != null) member.FullName = dto.Name;
        if (dto.Email != null) member.Email = dto.Email;
        if (dto.Points.HasValue) member.PointsBalance = dto.Points.Value;
        if (dto.TotalSpent.HasValue) member.TotalSpent = dto.TotalSpent.Value;
        if (dto.Tier != null) member.TierLevel = dto.Tier;

        await _membersRepo.UpdateAsync(member);

        return Ok(new
        {
            id = member.Id.ToString(),
            memberNo = member.MemberNo,
            name = member.FullName,
            phone = member.PhoneNumber,
            email = member.Email,
            points = member.PointsBalance,
            totalSpent = (double)member.TotalSpent,
            tier = member.TierLevel,
            joinDate = member.CreatedAt.ToString("yyyy-MM-dd")
        });
    }

    // 6. DELETE /api/members/{id} - Delete member
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(Guid id)
    {
        var member = await _membersRepo.FindAsync(id);
        if (member == null) return NotFound();

        await _membersRepo.DeleteAsync(member);
        return Ok(new { message = "Member deleted successfully." });
    }
}

public class CreateMemberDto
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int Points { get; set; } = 0;
    public decimal TotalSpent { get; set; } = 0m;
    public string Tier { get; set; } = "Standard";
}

public class UpdateMemberDto
{
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public int? Points { get; set; }
    public decimal? TotalSpent { get; set; }
    public string? Tier { get; set; }
}
