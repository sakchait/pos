using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Domain.Entities;
using Pos.Application.Repositories;
using User = Pos.Domain.Entities.User;

namespace Pos.Api.Controllers;

[ApiController]
[Route("api/external/admin/[controller]")]
[Authorize(Policy = "AdminOnly")]
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
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _usersRepo.GetAll()
            .Include(u => u.Role)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                RoleName = u.Role.Name,
                u.RoleId,
                u.BranchId,
                u.VendorId,
                u.IsAdmin,
                u.IsActive,
                u.CreatedAt
            }).ToListAsync();

        return Ok(users);
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
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _usersRepo.AddAsync(newUser);
        return Ok(new { message = "สร้างผู้ใช้งานสำเร็จ", userId = newUser.Id });
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