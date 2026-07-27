// Controllers/AuthController.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Pos.Application.Repositories;
using Pos.Domain.Entities;
using Presentation.Api.Authorization;

namespace Pos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[ApiKey]
public class AuthController : ControllerBase
{
    private readonly IRepository<User> _usersRepo;
    private readonly IConfiguration _config;

    public AuthController(IRepository<User> usersRepo, IConfiguration config)
    {
        _usersRepo = usersRepo;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest dto)
    {
        var user = await _usersRepo.GetAll()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == dto.Username && u.IsActive);

        var verified = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        // ตรวจสอบ Password (ควรใช้ BCrypt/Argon2 Verify)
        if (user == null || !verified)
            return Unauthorized(new { message = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" });

        // สร้าง JWT Claims
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:SecretKey"] ?? "SUPER_SECRET_KEY_POS_SYSTEM_2026_SECURITY_TOKEN");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.Name),
        };

        if (user.BranchId.HasValue) claims.Add(new Claim("BranchId", user.BranchId.ToString()!));
        if (user.VendorId.HasValue) claims.Add(new Claim("VendorId", user.VendorId.ToString()!));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(12), // Session 12 ชม.
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            user = new
            {
                user.Id,
                user.FullName,
                role = user.Role.Name,
                user.BranchId,
                user.VendorId
            }
        });
    }

    /// <summary>
    /// ยืนยัน PIN ผู้จัดการขณะหน้าร้านกด Void/Refund
    /// </summary>
    [HttpPost("verify-manager-pin")]
    public async Task<IActionResult> VerifyManagerPin([FromBody] VerifyPinRequest dto)
    {
        var manager = await _usersRepo.GetAll()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => (u.Role.Name == "BranchManager" || u.Role.Name == "Admin") && u.IsActive);

        if (manager == null || string.IsNullOrEmpty(manager.PinHash))
            return BadRequest(new { message = "ไม่พบข้อมูลผู้จัดการในสาขานี้" });

        if (!BCrypt.Net.BCrypt.Verify(dto.Pin, manager.PinHash))
            return Unauthorized(new { message = "รหัส PIN ผู้จัดการไม่ถูกต้อง" });

        return Ok(new { isValid = true, success = true, managerId = manager.Id, managerName = manager.FullName });
    }

    [HttpPost("login-pin")]
    public async Task<IActionResult> LoginPin([FromBody] LoginPinRequest dto)
    {
        var users = await _usersRepo.GetAll().Include(u => u.Role).ToListAsync();
        var user = users.FirstOrDefault(u => !string.IsNullOrEmpty(u.PinHash) && BCrypt.Net.BCrypt.Verify(dto.Pin, u.PinHash) && u.IsActive);

        if (user == null)
            return Unauthorized(new { message = "รหัส PIN ไม่ถูกต้อง" });

        // สร้าง JWT Claims
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:SecretKey"] ?? "SUPER_SECRET_KEY_POS_SYSTEM_2026_SECURITY_TOKEN");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.Name),
        };

        if (user.BranchId.HasValue) claims.Add(new Claim("BranchId", user.BranchId.ToString()!));
        if (user.VendorId.HasValue) claims.Add(new Claim("VendorId", user.VendorId.ToString()!));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(12),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new
        {
            token = tokenHandler.WriteToken(token),
            user = new
            {
                user.Id,
                user.FullName,
                role = user.Role.Name,
                user.BranchId,
                user.VendorId
            }
        });
    }
}

public record LoginRequest(string Username, string Password);
public record VerifyPinRequest(Guid BranchId, string Pin);
public record LoginPinRequest(string Pin);