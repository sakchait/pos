using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberPromotionSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "MemberPromotions",
                columns: new[] { "Id", "DiscountAmount", "EndDate", "FreeProductId", "FreeQuantity", "IsActive", "MinQuantity", "MinSpentAmount", "Name", "PromotionType", "StartDate" },
                values: new object[,]
                {
                    { new Guid("e1111111-e111-e111-e111-e11111111111"), 10.00m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), null, 0, true, 0, 100.00m, "Gold Member Welcome Discount", "MinSpentDiscount", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("e2222222-e222-e222-e222-e22222222222"), 0.00m, new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), new Guid("11111111-1111-1111-1111-111111111103"), 1, true, 2, 0.00m, "Latte Buy 2 Get 1 Free", "BuyXGetY", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "MemberPromotions",
                keyColumn: "Id",
                keyValue: new Guid("e1111111-e111-e111-e111-e11111111111"));

            migrationBuilder.DeleteData(
                table: "MemberPromotions",
                keyColumn: "Id",
                keyValue: new Guid("e2222222-e222-e222-e222-e22222222222"));
        }
    }
}
