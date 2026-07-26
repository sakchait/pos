// Application/DTOs/UserManagementDtos.cs
namespace Pos.Application.DTOs;

// DTO สำหรับ Admin จัดการ User อื่นๆ
public record CreateUserDto(
    string Username,
    string Password,
    string FullName,
    Guid RoleId,
    Guid? BranchId,
    Guid? VendorId,
    bool IsAdmin
);

public record UpdateUserRoleDto(
    Guid TargetUserId,
    Guid NewRoleId,
    bool IsAdmin
);

// DTO สำหรับ User ทุกคนแก้ไขตัวเอง
public record UpdateMyProfileDto(
    string FullName
);

public record ChangeMyPasswordDto(
    string CurrentPassword,
    string NewPassword
);