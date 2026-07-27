// Controllers/UserProfileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pos.Application.DTOs;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Pos.Domain.Persistence;
using System.Security.Claims;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
//[Authorize] // ผู้ใช้งานทุกคนที่ล็อกอินแล้วสามารถเข้าถึงได้
[ApiKey]
public class UserProfileController : ControllerBase
{
    private readonly IRepository<User> _userRepository;

    public UserProfileController(IRepository<User> userRepository)
    {
        _userRepository = userRepository;
    }

    // 1. ดึงข้อมูลโปรไฟล์ของตนเอง
    [HttpGet("/api/members")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _userRepository.GetAll()
            .Include(u => u.Role)
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.FullName,
                RoleName = u.Role.Name,
                u.IsAdmin,
                u.BranchId,
                u.VendorId
            }).FirstOrDefaultAsync();

        if (user == null) return NotFound();
        return Ok(user);
    }

    // 2. แก้ไขข้อมูลส่วนตัวของตนเอง (เปลี่ยนได้เฉพาะชื่อ-นามสกุล)
    [HttpPut("/api/members")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _userRepository.FindAsync(userId);

        if (user == null) return NotFound();

        user.FullName = dto.FullName;
        // ข้อสำคัญ: ไม่มีสิทธิ์แก้ไข RoleId หรือ IsAdmin ตรงนี้!

        await _userRepository.SaveChangesAsync();
        return Ok(new { message = "อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว" });
    }

    // 3. เปลี่ยนรหัสผ่านของตนเอง (Self Reset Password)
    [HttpPost("/api/members/change-password")]
    public async Task<IActionResult> ChangeMyPassword([FromBody] ChangeMyPasswordDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _userRepository.FindAsync(userId);

        if (user == null) return NotFound();

        // ตรวจสอบรหัสผ่านปัจจุบัน
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
        }

        // บันทึกรหัสผ่านใหม่
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
    }
}