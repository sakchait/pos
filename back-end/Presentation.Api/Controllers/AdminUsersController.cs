using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Domain.Entities;
using Pos.Application.Repositories;
using User = Pos.Domain.Entities.User;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
//[Authorize(Policy = "AdminOnly")]
[ApiKey]
public class AdminUsersController : ControllerBase
{
    private readonly IRepository<User> _usersRepo;
    private readonly IRepository<RoleChangeAuditLog> _auditRepo;

    public AdminUsersController(
        IRepository<User> usersRepo,
        IRepository<RoleChangeAuditLog> auditRepo)
    {
        _usersRepo = usersRepo;
        _auditRepo = auditRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers([FromQuery] int? page, [FromQuery] int? pageSize)
    {
        var query = _usersRepo.GetAll()
            .Include(u => u.Role);

        if (page.HasValue && pageSize.HasValue)
        {
            var totalCount = await query.CountAsync();
            var list = await query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value)
                .ToListAsync();

            var items = list.Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                RoleName = u.Role != null ? u.Role.Name : "",
                u.RoleId,
                u.BranchId,
                u.VendorId,
                u.HourlyRate,
                u.IsAdmin,
                u.IsActive,
                u.CreatedAt
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
            var list = await query.ToListAsync();
            var result = list.Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                RoleName = u.Role != null ? u.Role.Name : "",
                u.RoleId,
                u.BranchId,
                u.VendorId,
                u.HourlyRate,
                u.IsAdmin,
                u.IsActive,
                u.CreatedAt
            }).ToList();

            return Ok(result);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (await _usersRepo.GetAll().AnyAsync(u => u.Username == dto.Username))
            return BadRequest(new { message = "Username นี้มีอยู่ในระบบแล้ว" });

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            RoleId = dto.RoleId,
            BranchId = dto.BranchId,
            VendorId = dto.VendorId,
            IsAdmin = dto.IsAdmin,
            HourlyRate = dto.HourlyRate,
            PinHash = !string.IsNullOrEmpty(dto.Pin) ? BCrypt.Net.BCrypt.HashPassword(dto.Pin) : null,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _usersRepo.AddAsync(newUser);
        return Ok(new { message = "สร้างผู้ใช้งานสำเร็จ", userId = newUser.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var targetUser = await _usersRepo.GetAll().FirstOrDefaultAsync(u => u.Id == id);
        if (targetUser == null)
            return NotFound(new { message = "ไม่พบผู้ใช้งาน" });

        targetUser.FullName = dto.FullName;
        targetUser.Username = dto.Username;
        targetUser.RoleId = dto.RoleId;
        targetUser.BranchId = dto.BranchId;
        targetUser.VendorId = dto.VendorId;
        targetUser.HourlyRate = dto.HourlyRate;
        targetUser.IsAdmin = dto.IsAdmin;
        targetUser.IsActive = dto.IsActive;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            targetUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }
        if (!string.IsNullOrEmpty(dto.Pin))
        {
            targetUser.PinHash = BCrypt.Net.BCrypt.HashPassword(dto.Pin);
        }

        await _usersRepo.UpdateAsync(targetUser);
        return Ok(new { message = "อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _usersRepo.GetAll().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        await _usersRepo.DeleteAsync(user);
        return Ok(new { message = "ลบผู้ใช้งานเรียบร้อยแล้ว" });
    }

    [HttpPut("update-role")]
    public async Task<IActionResult> UpdateUserRole([FromBody] UpdateUserRoleDto dto)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var targetUser = await _usersRepo.GetAll().FirstOrDefaultAsync(u => u.Id == dto.TargetUserId);

        if (targetUser == null)
            return NotFound(new { message = "ไม่พบผู้ใช้งาน" });

        await _auditRepo.AddAsync(new RoleChangeAuditLog
        {
            Id = Guid.NewGuid(),
            TargetUserId = targetUser.Id,
            OldRoleId = targetUser.RoleId,
            NewRoleId = dto.NewRoleId,
            ChangedByAdminId = adminId,
            ChangedAt = DateTime.UtcNow
        });

        targetUser.RoleId = dto.NewRoleId;
        targetUser.IsAdmin = dto.IsAdmin;

        await _usersRepo.UpdateAsync(targetUser);
        return Ok(new { message = "อัปเดตสิทธิ์ผู้ใช้งานเรียบร้อยแล้ว" });
    }

    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var user = await _usersRepo.GetAll().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound();

        user.IsActive = !user.IsActive;
        await _usersRepo.UpdateAsync(user);
        return Ok(new { message = "อัปเดตสถานะผู้ใช้งานเรียบร้อยแล้ว", isActive = user.IsActive });
    }
}