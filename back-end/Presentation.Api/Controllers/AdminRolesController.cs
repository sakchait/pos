using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Domain.Entities;
using Pos.Application.Repositories;

namespace Pos.Api.Controllers;

[ApiController]
[Route("api/external/admin/[controller]")]
[Authorize(Policy = "AdminOnly")] // เฉพาะ IsAdmin = true เท่านั้นที่เข้าใช้งานได้
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

    // 1. ดึงรายการ Role ทั้งหมดพร้อมสิทธิ์ RoutePath
    [HttpGet]
    public async Task<IActionResult> GetRolesWithRoutes()
    {
        var roles = await _rolesRepo.GetAll().ToListAsync();
        var permissions = await _permissionsRepo.GetAll().ToListAsync();

        var result = roles.Select(role => new RoleWithRoutesDto(
            role.Id,
            role.Name,
            permissions
                .Where(p => p.RoleId == role.Id && p.IsAllowed)
                .Select(p => p.RoutePath)
                .ToList()
        )).ToList();

        return Ok(result);
    }

    // 2. อัปเดตรายการ Routes ที่ Role สามารถเข้าถึงได้
    [HttpPut("update-routes")]
    public async Task<IActionResult> UpdateRoleRoutes([FromBody] UpdateRoleRoutesDto dto)
    {
        try
        {
            // อ่านรายการสิทธิ์เดิม
            var existingPermissions = await _permissionsRepo.GetAll()
                .Where(p => p.RoleId == dto.RoleId)
                .ToListAsync();

            if (existingPermissions.Any())
            {
                await _permissionsRepo.DeleteRangeAsync(existingPermissions);
            }

            // บันทึกรายการสิทธิ์ Route ใหม่ที่เลือก
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

    // 3. API สำหรับ Public/Client ดึงรายการ Map ของทุก Role ไปใช้ใน Next.js Middleware (Cached API)
    [HttpGet("public-route-matrix")]
    [AllowAnonymous] // หรือใช้ Internal API Secret
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