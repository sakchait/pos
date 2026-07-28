using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddPosTerminalTableAndSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PosTerminals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TerminalId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BranchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PosTerminals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PosTerminals_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "Id", "Address", "Code", "Name", "TaxId" },
                values: new object[] { new Guid("a2222222-a222-a222-a222-a22222222222"), "991 Rama I Rd, Bangkok", "35", "Siam Paragon Branch", null });

            migrationBuilder.InsertData(
                table: "PosTerminals",
                columns: new[] { "Id", "BranchId", "Name", "TerminalId" },
                values: new object[,]
                {
                    { new Guid("c1111111-c111-c111-c111-c11111111111"), new Guid("a1111111-a111-a111-a111-a11111111111"), "Head Office Terminal 1", "N01" },
                    { new Guid("c1111111-c111-c111-c111-c11111111112"), new Guid("a1111111-a111-a111-a111-a11111111111"), "Head Office Terminal 2", "N02" },
                    { new Guid("c2222222-c222-c222-c222-c22222222221"), new Guid("a2222222-a222-a222-a222-a22222222222"), "Siam Paragon Terminal 1", "N02" },
                    { new Guid("c2222222-c222-c222-c222-c22222222222"), new Guid("a2222222-a222-a222-a222-a22222222222"), "Siam Paragon Terminal 2", "N03" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PosTerminals_BranchId_TerminalId",
                table: "PosTerminals",
                columns: new[] { "BranchId", "TerminalId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PosTerminals");

            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "Id",
                keyValue: new Guid("a2222222-a222-a222-a222-a22222222222"));
        }
    }
}
