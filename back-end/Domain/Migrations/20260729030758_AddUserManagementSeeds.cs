using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddUserManagementSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111118"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111119"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111120"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111121"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111122"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111125"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111126"));

            migrationBuilder.InsertData(
                table: "RoleRoutePermissions",
                columns: new[] { "Id", "CreatedAt", "IsAllowed", "RoleId", "RoutePath" },
                values: new object[] { new Guid("aa111111-1111-1111-1111-111111111128"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/admin/users" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111128"));

            migrationBuilder.InsertData(
                table: "RoleRoutePermissions",
                columns: new[] { "Id", "CreatedAt", "IsAllowed", "RoleId", "RoutePath" },
                values: new object[,]
                {
                    { new Guid("aa111111-1111-1111-1111-111111111118"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/pos" },
                    { new Guid("aa111111-1111-1111-1111-111111111119"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/shifts" },
                    { new Guid("aa111111-1111-1111-1111-111111111120"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/shifts/schedule" },
                    { new Guid("aa111111-1111-1111-1111-111111111121"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/vendor" },
                    { new Guid("aa111111-1111-1111-1111-111111111122"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/reports" },
                    { new Guid("aa111111-1111-1111-1111-111111111125"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/admin/coupons" },
                    { new Guid("aa111111-1111-1111-1111-111111111126"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/admin/members" }
                });
        }
    }
}
