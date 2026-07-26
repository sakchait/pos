// Application/DTOs/RoleManagementDtos.cs
namespace Pos.Application.DTOs;

public record RoleWithRoutesDto(
    Guid RoleId,
    string RoleName,
    List<string> AllowedRoutes
);

public record UpdateRoleRoutesDto(
    Guid RoleId,
    List<string> AllowedRoutes
);