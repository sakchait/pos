using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberEmailAndSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Members",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Members",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "MemberNo", "PhoneNumber", "PointsBalance", "TierLevel", "TotalSpent" },
                values: new object[,]
                {
                    { new Guid("d1111111-d111-d111-d111-d11111111111"), new DateTime(2024, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), "sarah.j@example.com", "Sarah Jenkins", "M-1001", "0812345678", 540, "Gold", 1200.00m },
                    { new Guid("d2222222-d222-d222-d222-d22222222222"), new DateTime(2023, 11, 20, 0, 0, 0, 0, DateTimeKind.Utc), "alex.r@example.com", "Alex Rivera", "M-1002", "0898765432", 1250, "Platinum", 4500.00m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Members",
                keyColumn: "Id",
                keyValue: new Guid("d1111111-d111-d111-d111-d11111111111"));

            migrationBuilder.DeleteData(
                table: "Members",
                keyColumn: "Id",
                keyValue: new Guid("d2222222-d222-d222-d222-d22222222222"));

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Members");
        }
    }
}
