using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Domain.Entities;
using Pos.Application.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
//[Authorize(Policy = "AdminOnly")] // Fallback authorization filter
[ApiKey]
public class AdminRolesController : ControllerBase
{
    private readonly IRepository<Role> _rolesRepo;
    private readonly IRepository<RoleRoutePermission> _permissionsRepo;

    public AdminRolesController(
        IRepository<Role> rolesRepo,
        IRepository<RoleRoutePermission> permissionsRepo)
    {
        _rolesRepo = rolesRepo;
        _permissionsRepo = permissionsRepo;
    }

    // 1. GET /api/external/admin/AdminRoles - Fetches role permissions matrix from C# backend
    [HttpGet("/api/external/admin/AdminRoles")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAdminRoles()
    {
        var roles = await _rolesRepo.GetAll().ToListAsync();
        var permissions = await _permissionsRepo.GetAll().ToListAsync();

        var result = roles.Select(role => new
        {
            roleId = role.Id,
            roleName = role.Name,
            allowedRoutes = permissions
                .Where(p => p.RoleId == role.Id && p.IsAllowed)
                .Select(p => p.RoutePath)
                .ToList()
        }).ToList();

        return Ok(result);
    }

    // 2. GET /api/role-routes - Local Express routing table fallback
    [HttpGet("/api/role-routes")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRoleRoutes()
    {
        var roles = await _rolesRepo.GetAll().ToListAsync();
        var permissions = await _permissionsRepo.GetAll().ToListAsync();

        var result = roles.Select(role => new
        {
            role = role.Name,
            routes = permissions
                .Where(p => p.RoleId == role.Id && p.IsAllowed)
                .Select(p => p.RoutePath)
                .ToList()
        }).ToList();

        return Ok(result);
    }

    // 3. PUT /api/external/admin/AdminRoles/update-routes - Updates permissions matrix on C# backend
    [HttpPut("/api/external/admin/AdminRoles/update-routes")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateRoleRoutes([FromBody] UpdateRoleRoutesDto dto)
    {
        try
        {
            var existingPermissions = await _permissionsRepo.GetAll()
                .Where(p => p.RoleId == dto.RoleId)
                .ToListAsync();

            if (existingPermissions.Any())
            {
                await _permissionsRepo.DeleteRangeAsync(existingPermissions);
            }

            foreach (var route in dto.AllowedRoutes.Distinct())
            {
                if (!string.IsNullOrWhiteSpace(route))
                {
                    await _permissionsRepo.AddAsync(new RoleRoutePermission
                    {
                        Id = Guid.NewGuid(),
                        RoleId = dto.RoleId,
                        RoutePath = route.Trim(),
                        IsAllowed = true
                    });
                }
            }

            return Ok(new { message = "อัปเดตสิทธิ์การเข้าถึง Route สำหรับ Role เรียบร้อยแล้ว" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "เกิดข้อผิดพลาดในการอัปเดตสิทธิ์", error = ex.Message });
        }
    }

    // 4. PUT /api/role-routes/{role} - Local Express fallback routing table update
    public class UpdateRoleRouteByNameRequest
    {
        public List<string> Routes { get; set; } = new();
    }

    [HttpPut("/api/role-routes/{roleName}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateRoleRoutesByName(string roleName, [FromBody] UpdateRoleRouteByNameRequest request)
    {
        try
        {
            var role = await _rolesRepo.GetAll().FirstOrDefaultAsync(r => r.Name == roleName);
            if (role == null)
            {
                return NotFound(new { message = $"Role '{roleName}' not found." });
            }

            var existingPermissions = await _permissionsRepo.GetAll()
                .Where(p => p.RoleId == role.Id)
                .ToListAsync();

            if (existingPermissions.Any())
            {
                await _permissionsRepo.DeleteRangeAsync(existingPermissions);
            }

            foreach (var route in request.Routes.Distinct())
            {
                if (!string.IsNullOrWhiteSpace(route))
                {
                    await _permissionsRepo.AddAsync(new RoleRoutePermission
                    {
                        Id = Guid.NewGuid(),
                        RoleId = role.Id,
                        RoutePath = route.Trim(),
                        IsAllowed = true
                    });
                }
            }

            return Ok(new { message = $"Role '{roleName}' routes updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "เกิดข้อผิดพลาดในการอัปเดตสิทธิ์", error = ex.Message });
        }
    }

    // 5. API สำหรับ Next.js Middleware (Cached API)
    [HttpGet("/api/public-route-matrix")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublicRouteMatrix()
    {
        var roles = await _rolesRepo.GetAll().ToListAsync();
        var permissions = await _permissionsRepo.GetAll().Where(p => p.IsAllowed).ToListAsync();

        var matrix = roles.ToDictionary(
            r => r.Name,
            r => permissions.Where(p => p.RoleId == r.Id).Select(p => p.RoutePath).ToList()
        );

        return Ok(matrix);
    }
}