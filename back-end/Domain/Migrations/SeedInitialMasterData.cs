using System;
using Microsoft.EntityFrameworkCore.Migrations;
#nullable disable
namespace Pos.Domain.Migrations;

public partial class SeedInitialMasterData : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.InsertData(
            table: "Roles",
            columns: new[] { "Id", "Name" },
            values: new object[,]
            {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Admin" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Cashier" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "BranchManager" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "Accountant" },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "Vendor" },
                    { new Guid("66666666-6666-6666-6666-666666666666"), "PurchaserManager" },
                    { new Guid("77777777-7777-7777-7777-777777777777"), "StockClerk" }
            });

        migrationBuilder.InsertData(
            table: "Branches",
            columns: new[] { "Id", "Code", "Name", "TaxId" },
            values: new object[] { new Guid("a1111111-a111-a111-a111-a11111111111"), "HO01", "Head Office - Bangkok", "0105551234567" });

        migrationBuilder.InsertData(
            table: "Users",
            columns: new[] { "Id", "BranchId", "CreatedAt", "FullName", "HourlyRate", "IsActive", "IsAdmin", "PasswordHash", "PinHash", "RoleId", "Username", "VendorId" },
            values: new object[] { new Guid("99999999-9999-9999-9999-999999999999"), new Guid("a1111111-a111-a111-a111-a11111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System Administrator", 50.00m, true, true, "$2a$11$8q3/p6K0iA1Xv0vG0mJ5.u8A9d1E3f5G7h9i1J3k5L7m9N1O3P5Q6", null, new Guid("11111111-1111-1111-1111-111111111111"), "admin", null });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DeleteData(table: "Users", keyColumn: "Id", keyValue: new Guid("99999999-9999-9999-9999-999999999999"));
        migrationBuilder.DeleteData(table: "Branches", keyColumn: "Id", keyValue: new Guid("a1111111-a111-a111-a111-a11111111111"));
        migrationBuilder.DeleteData(table: "Roles", keyColumn: "Id", keyValue: new Guid("11111111-1111-1111-1111-111111111111"));
        // ... (other deletes)
    }
}
