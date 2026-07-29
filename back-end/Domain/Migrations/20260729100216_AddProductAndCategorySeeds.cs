using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddProductAndCategorySeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "RoleRoutePermissions",
                columns: new[] { "Id", "CreatedAt", "IsAllowed", "RoleId", "RoutePath" },
                values: new object[,]
                {
                    { new Guid("aa111111-1111-1111-1111-111111111129"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/admin/products" },
                    { new Guid("aa111111-1111-1111-1111-111111111130"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("11111111-1111-1111-1111-111111111111"), "/admin/categories" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111129"));

            migrationBuilder.DeleteData(
                table: "RoleRoutePermissions",
                keyColumn: "Id",
                keyValue: new Guid("aa111111-1111-1111-1111-111111111130"));
        }
    }
}
