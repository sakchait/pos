using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Pos.Domain.Security;
using Presentation.Api.Authorization;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pos.Api.Controllers;

[ApiController]
[ApiKey]
[Route("api/[controller]")]
public class SystemAuditLogsController : ControllerBase
{
    private readonly IRepository<SystemAuditLog> _logsRepo;
    private readonly IRepository<User> _usersRepo;

    public SystemAuditLogsController(IRepository<SystemAuditLog> logsRepo, IRepository<User> usersRepo)
    {
        _logsRepo = logsRepo;
        _usersRepo = usersRepo;
    }

    // 1. GET /api/systemauditlogs - Get all audit logs with verification status
    [HttpGet]
    public async Task<IActionResult> GetLogs(CancellationToken cancellationToken)
    {
        var logs = await _logsRepo.GetAll()
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var users = await _usersRepo.GetAll()
            .AsNoTracking()
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        var response = logs.Select(log =>
        {
            users.TryGetValue(log.UserId, out var user);
            var fullName = user?.FullName ?? "Unknown User";
            var username = user?.Username ?? "unknown";

            // Verify integrity
            var computedSig = HmacSecurity.ComputeAuditLogSignature(
                log.Id.ToString(),
                log.UserId.ToString(),
                log.Action,
                log.Description,
                log.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            );

            var isVerified = !string.IsNullOrEmpty(log.HmacSignature) && 
                             log.HmacSignature.Equals(computedSig, StringComparison.OrdinalIgnoreCase);

            return new
            {
                id = log.Id.ToString(),
                userId = log.UserId.ToString(),
                action = log.Action,
                description = log.Description,
                hmacSignature = log.HmacSignature,
                createdAt = log.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                fullName = fullName,
                username = username,
                isVerified = isVerified
            };
        })
        .OrderByDescending(x => x.createdAt)
        .ToList();

        return Ok(response);
    }

    // 2. POST /api/systemauditlogs - Create a new signed audit log
    [HttpPost]
    public async Task<IActionResult> CreateLog([FromBody] CreateLogDto dto, CancellationToken cancellationToken)
    {
        var logId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var hmacSignature = HmacSecurity.ComputeAuditLogSignature(
            logId.ToString(),
            dto.UserId.ToString(),
            dto.Action,
            dto.Description,
            createdAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
        );

        var log = new SystemAuditLog
        {
            Id = logId,
            UserId = dto.UserId,
            Action = dto.Action,
            Description = dto.Description,
            HmacSignature = hmacSignature,
            CreatedAt = createdAt
        };

        await _logsRepo.AddAsync(log);
        await _logsRepo.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            id = log.Id.ToString(),
            userId = log.UserId.ToString(),
            action = log.Action,
            description = log.Description,
            hmacSignature = log.HmacSignature,
            createdAt = log.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            isVerified = true
        });
    }
}

public record CreateLogDto(
    Guid UserId,
    string Action,
    string Description
);
