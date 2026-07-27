using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBranchAndSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-a111-a111-a111-a11111111111"),
                columns: new[] { "Address", "Code", "Name", "TaxId" },
                values: new object[] { "123 Main Street, Bangkok", "BR001", "Head Office Branch", null });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                column: "PasswordHash",
                value: "$2a$11$uC19S.8s3RpTb1hz7wKJouDpB766FnaRg500LzBhCb9rmVjsmSygu");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-a111-a111-a111-a11111111111"),
                columns: new[] { "Address", "Code", "Name", "TaxId" },
                values: new object[] { null, "HO01", "Head Office - Bangkok", "0105551234567" });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                column: "PasswordHash",
                value: "$2a$11$F8tjZZi6VF.ICf6dL20Q4uzSCZ.iJJAHjN/QMsoag0Pujm8aqzN6W");
        }
    }
}
