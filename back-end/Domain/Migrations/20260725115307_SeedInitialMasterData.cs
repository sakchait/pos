using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Pos.Domain.Persistence;

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
            table: "ShiftTypes",
            columns: new[] { "Id", "EndTime", "Name", "StartTime" },
            values: new object[,]
            {
                { 1, new TimeSpan(14, 0, 0), "กะเช้า", new TimeSpan(6, 0, 0) },
                { 2, new TimeSpan(22, 0, 0), "กะบ่าย", new TimeSpan(14, 0, 0) },
                { 3, new TimeSpan(6, 0, 0), "กะดึก", new TimeSpan(22, 0, 0) }
            });

        migrationBuilder.InsertData(
            table: "Users",
            columns: new[] { "Id", "BranchId", "CreatedAt", "FullName", "HourlyRate", "IsActive", "IsAdmin", "PasswordHash", "PinHash", "RoleId", "Username", "VendorId" },
            values: new object[,]
            {
                { new Guid("99999999-9999-9999-9999-999999999999"), new Guid("a1111111-a111-a111-a111-a11111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System Administrator", 50.00m, true, true, "$2a$11$8q3/p6K0iA1Xv0vG0mJ5.u8A9d1E3f5G7h9i1J3k5L7m9N1O3P5Q6", "$2a$11$HjJ4K5vA3k9L9D/s8r5E6uOumS9h1R2D3y5G7h9i1J3k5L7m9N1O3P", new Guid("11111111-1111-1111-1111-111111111111"), "admin", null },
                { new Guid("33333333-3333-3333-3333-333333333334"), new Guid("a1111111-a111-a111-a111-a11111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sarah Jenkins", 25.00m, true, false, "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", new Guid("33333333-3333-3333-3333-333333333333"), "sarah.jenkins", null },
                { new Guid("33333333-3333-3333-3333-333333333302"), new Guid("a1111111-a111-a111-a111-a11111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Alex Rivera", 18.00m, true, false, "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", new Guid("22222222-2222-2222-2222-222222222222"), "alex.rivera", null },
                { new Guid("33333333-3333-3333-3333-333333333303"), new Guid("a1111111-a111-a111-a111-a11111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Mark Tanaka", 20.00m, true, false, "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", new Guid("77777777-7777-7777-7777-777777777777"), "mark.tanaka", null },
                { new Guid("33333333-3333-3333-3333-333333333304"), new Guid("a1111111-a111-a111-a111-a11111111111"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Elena Rostova", 22.00m, true, false, "$2a$11$Z6C1e9F4h8j2L6n0p4r8tux4v2z6B8d0f2h4j6l8n0p2r4t6v8z0B", "$2a$11$FmBv6XyG/d9W7yCsh.tWnOHHkQnpeEa7M24c/Lupz9B9K.Yx4qBbe", new Guid("66666666-6666-6666-6666-666666666666"), "purchaser.admin", null }
            });

        migrationBuilder.InsertData(
            table: "Coupons",
            columns: new[] { "Code", "Description", "DiscountType", "DiscountValue", "MaxDiscountAmount", "MinOrderAmount", "StartDate", "EndDate", "ApplicableProductIdsJson", "UsageLimit", "UsedCount", "IsActive", "UpdatedAt" },
            values: new object[,]
            {
                { "WELCOME10", "10% Welcome Discount", "Percentage", 10m, 15m, 20m, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc), "[]", 1000, 42, true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { "FLASH5", "$5 off on order above $30", "Fixed", 5m, 5m, 30m, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc), "[]", 500, 18, true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { "VIPBURGER", "20% off on Burger combos", "Percentage", 20m, 10m, 15m, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc), "[]", 100, 5, true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            });

        migrationBuilder.InsertData(
            table: "Products",
            columns: new[] { "Id", "Code", "Name", "Price", "StandardCost", "MinStockThreshold", "IsVatInclusive", "IsActive", "Version", "UpdatedAt", "StockQuantity" },
            values: new object[,]
            {
                { new Guid("11111111-1111-1111-1111-111111111101"), "0012", "Mediterranean Salad", 14.50m, 5.00m, 10, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 35 },
                { new Guid("11111111-1111-1111-1111-111111111102"), "0054", "Signature Burger", 18.00m, 6.50m, 15, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 42 },
                { new Guid("11111111-1111-1111-1111-111111111103"), "0098", "Artisan Latte", 5.25m, 1.50m, 20, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 80 },
                { new Guid("11111111-1111-1111-1111-111111111104"), "0112", "Glazed Donut", 3.50m, 1.00m, 12, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 50 },
                { new Guid("11111111-1111-1111-1111-111111111105"), "0087", "Mixed Grill", 24.00m, 9.00m, 8, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 3 },
                { new Guid("11111111-1111-1111-1111-111111111106"), "0041", "Truffle Fries", 8.50m, 2.50m, 15, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 65 },
                { new Guid("11111111-1111-1111-1111-111111111107"), "0203", "Iced Matcha Latte", 6.00m, 2.00m, 10, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 2 },
                 { new Guid("11111111-1111-1111-1111-111111111108"), "0319", "Ribeye Steak 300g", 38.00m, 15.00m, 12, true, true, 1, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), 4 }
            });

        migrationBuilder.InsertData(
            table: "ShiftSchedules",
            columns: new[] { "Id", "UserId", "BranchId", "ShiftTypeId", "WorkDate", "Status", "RoleInShift" },
            values: new object[,]
            {
                { new Guid("44444444-4444-4444-4444-444444444401"), new Guid("33333333-3333-3333-3333-333333333334"), new Guid("a1111111-a111-a111-a111-a11111111111"), 1, new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc), "Scheduled", "Cashier" },
                { new Guid("44444444-4444-4444-4444-444444444402"), new Guid("33333333-3333-3333-3333-333333333302"), new Guid("a1111111-a111-a111-a111-a11111111111"), 1, new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc), "Scheduled", "BranchManager" },
                { new Guid("44444444-4444-4444-4444-444444444403"), new Guid("33333333-3333-3333-3333-333333333303"), new Guid("a1111111-a111-a111-a111-a11111111111"), 2, new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc), "Scheduled", "Cashier" },
                { new Guid("44444444-4444-4444-4444-444444444404"), new Guid("33333333-3333-3333-3333-333333333304"), new Guid("a1111111-a111-a111-a111-a11111111111"), 3, new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc), "Scheduled", "Cashier" }
            });

        migrationBuilder.InsertData(
            table: "ShiftSwapRequests",
            columns: new[] { "Id", "RequestorShiftId", "TargetUserId", "TargetShiftId", "Reason", "Status", "ManagerApprovedBy", "CreatedAt" },
            values: new object[] { new Guid("55555555-5555-5555-5555-555555555501"), new Guid("44444444-4444-4444-4444-444444444401"), new Guid("33333333-3333-3333-3333-333333333303"), null, "Family emergency", "PendingPeer", null, new DateTime(2026, 7, 25, 10, 30, 0, DateTimeKind.Utc) });

        migrationBuilder.InsertData(
            table: "Warehouses",
            columns: new[] { "Id", "BranchId", "Name", "IsMainWarehouse" },
            values: new object[] { new Guid("b1111111-b111-b111-b111-b11111111111"), new Guid("a1111111-a111-a111-a111-a11111111111"), "Main Warehouse", true });

        migrationBuilder.InsertData(
            table: "Vendors",
            columns: new[] { "Id", "TaxId", "Name", "ContactPerson", "Email", "Phone", "IsActive" },
            values: new object[] { new Guid("d1111111-d111-d111-d111-d11111111111"), "0105551234599", "Global Foods Co.", "Jane Smith", "vendor@globalfoods.com", "0819876543", true });

        migrationBuilder.InsertData(
            table: "PurchaseOrders",
            columns: new[] { "Id", "PoNumber", "VendorId", "WarehouseId", "TotalAmount", "Status", "ProposedByVendor", "ApprovedBy", "ApprovedAt", "CreatedAt" },
            values: new object[] { new Guid("66666666-6666-6666-6666-666666666601"), "PO-20260725-01", new Guid("d1111111-d111-d111-d111-d11111111111"), new Guid("b1111111-b111-b111-b111-b11111111111"), 54.00m, "Proposed", true, null, null, new DateTime(2026, 7, 25, 8, 30, 0, DateTimeKind.Utc) });

        migrationBuilder.InsertData(
            table: "PurchaseOrderItems",
            columns: new[] { "Id", "PurchaseOrderId", "ProductId", "Quantity", "UnitPrice", "SubTotal" },
            values: new object[] { new Guid("66666666-6666-6666-6666-666666666602"), new Guid("66666666-6666-6666-6666-666666666601"), new Guid("11111111-1111-1111-1111-111111111102"), 3, 18.00m, 54.00m });

        migrationBuilder.InsertData(
            table: "StockBatches",
            columns: new[] { "Id", "WarehouseId", "ProductId", "PurchaseOrderId", "BatchNumber", "UnitCost", "InitialQuantity", "RemainingQuantity", "ReceivedDate", "ExpiryDate" },
            values: new object[] { new Guid("77777777-7777-7777-7777-777777777701"), new Guid("b1111111-b111-b111-b111-b11111111111"), new Guid("11111111-1111-1111-1111-111111111102"), Guid.Empty, "BATCH-INITIAL-01", 6.50m, 50, 42, new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2027, 7, 1, 0, 0, 0, DateTimeKind.Utc) });

        migrationBuilder.InsertData(
            table: "Attendances",
            columns: new[] { "Id", "UserId", "ClockIn", "ClockOut" },
            values: new object[,]
            {
                { new Guid("88888888-8888-8888-8888-888888888801"), new Guid("33333333-3333-3333-3333-333333333334"), new DateTime(2026, 7, 25, 6, 8, 0, DateTimeKind.Utc), new DateTime(2026, 7, 25, 14, 2, 0, DateTimeKind.Utc) },
                { new Guid("88888888-8888-8888-8888-888888888802"), new Guid("33333333-3333-3333-3333-333333333303"), new DateTime(2026, 7, 25, 14, 14, 0, DateTimeKind.Utc), new DateTime(2026, 7, 25, 22, 5, 0, DateTimeKind.Utc) },
                { new Guid("88888888-8888-8888-8888-888888888803"), new Guid("33333333-3333-3333-3333-333333333302"), new DateTime(2026, 7, 25, 5, 54, 0, DateTimeKind.Utc), new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc) }
            });

        migrationBuilder.InsertData(
            table: "LeaveRequests",
            columns: new[] { "Id", "UserId", "LeaveType", "StartDate", "EndDate", "Reason", "Status", "ApprovedBy", "CreatedAt" },
            values: new object[,]
            {
                { new Guid("99999999-9999-9999-9999-999999999901"), new Guid("33333333-3333-3333-3333-333333333304"), "SickLeave", new DateTime(2026, 7, 20, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 21, 0, 0, 0, DateTimeKind.Utc), "High fever and flu", "Approved", null, new DateTime(2026, 7, 20, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("99999999-9999-9999-9999-999999999902"), new Guid("33333333-3333-3333-3333-333333333334"), "AnnualLeave", new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 8, 5, 0, 0, 0, DateTimeKind.Utc), "Family vacation", "Approved", null, new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc) }
            });

        migrationBuilder.InsertData(
            table: "RoleRoutePermissions",
            columns: new[] { "Id", "RoleId", "RoutePath", "IsAllowed", "CreatedAt" },
            values: new object[,]
            {
                // Cashier
                { new Guid("aa111111-1111-1111-1111-111111111101"), new Guid("22222222-2222-2222-2222-222222222222"), "/pos", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111102"), new Guid("22222222-2222-2222-2222-222222222222"), "/shifts", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111103"), new Guid("22222222-2222-2222-2222-222222222222"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // BranchManager
                { new Guid("aa111111-1111-1111-1111-111111111104"), new Guid("33333333-3333-3333-3333-333333333333"), "/pos", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111105"), new Guid("33333333-3333-3333-3333-333333333333"), "/shifts", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111106"), new Guid("33333333-3333-3333-3333-333333333333"), "/reports", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111107"), new Guid("33333333-3333-3333-3333-333333333333"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // Accountant
                { new Guid("aa111111-1111-1111-1111-111111111108"), new Guid("44444444-4444-4444-4444-444444444444"), "/reports", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111109"), new Guid("44444444-4444-4444-4444-444444444444"), "/vendor", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111110"), new Guid("44444444-4444-4444-4444-444444444444"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // Vendor
                { new Guid("aa111111-1111-1111-1111-111111111111"), new Guid("55555555-5555-5555-5555-555555555555"), "/vendor", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111112"), new Guid("55555555-5555-5555-5555-555555555555"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // PurchaserManager
                { new Guid("aa111111-1111-1111-1111-111111111113"), new Guid("66666666-6666-6666-6666-666666666666"), "/vendor", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111114"), new Guid("66666666-6666-6666-6666-666666666666"), "/inventory", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111115"), new Guid("66666666-6666-6666-6666-666666666666"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // StockClerk
                { new Guid("aa111111-1111-1111-1111-111111111116"), new Guid("77777777-7777-7777-7777-777777777777"), "/inventory", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111117"), new Guid("77777777-7777-7777-7777-777777777777"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // Admin
                { new Guid("aa111111-1111-1111-1111-111111111118"), new Guid("11111111-1111-1111-1111-111111111111"), "/pos", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111119"), new Guid("11111111-1111-1111-1111-111111111111"), "/shifts", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111120"), new Guid("11111111-1111-1111-1111-111111111111"), "/shifts/schedule", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111121"), new Guid("11111111-1111-1111-1111-111111111111"), "/vendor", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111122"), new Guid("11111111-1111-1111-1111-111111111111"), "/reports", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111123"), new Guid("11111111-1111-1111-1111-111111111111"), "/admin/roles", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                { new Guid("aa111111-1111-1111-1111-111111111124"), new Guid("11111111-1111-1111-1111-111111111111"), "/profile", true, new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            });

        migrationBuilder.InsertData(
            table: "DrawerOpenLogs",
            columns: new[] { "Id", "BranchId", "PosTerminalId", "ShiftId", "CashierId", "ApprovedBy", "Reason", "OpenedAt" },
            values: new object[,]
            {
                { new Guid("cc111111-1111-1111-1111-111111111101"), new Guid("a1111111-a111-a111-a111-a11111111111"), "term-1", new Guid("44444444-4444-4444-4444-444444444401"), new Guid("33333333-3333-3333-3333-333333333334"), new Guid("33333333-3333-3333-3333-333333333302"), "NO_SALE", new DateTime(2026, 7, 25, 9, 30, 0, DateTimeKind.Utc) },
                { new Guid("cc111111-1111-1111-1111-111111111102"), new Guid("a1111111-a111-a111-a111-a11111111111"), "term-1", new Guid("44444444-4444-4444-4444-444444444403"), new Guid("33333333-3333-3333-3333-333333333303"), null, "MANUAL_OPEN", new DateTime(2026, 7, 25, 15, 45, 0, DateTimeKind.Utc) }
            });

        migrationBuilder.InsertData(
            table: "CashierShifts",
            columns: new[] { "Id", "BranchId", "PosTerminalId", "CashierId", "OpenedAt", "ClosedAt", "OpeningCash", "TotalSystemCashSales", "TotalCashPaidIn", "TotalCashPaidOut", "ExpectedCash", "ActualCashCounted", "CashDifference", "Status", "CloseNotes" },
            values: new object[,]
            {
                { new Guid("ee111111-1111-1111-1111-111111111101"), new Guid("a1111111-a111-a111-a111-a11111111111"), "term-1", new Guid("33333333-3333-3333-3333-333333333334"), new DateTime(2026, 7, 25, 6, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc), 100.00m, 350.00m, 0.00m, 0.00m, 450.00m, 450.00m, 0.00m, "Closed", null },
                { new Guid("ee111111-1111-1111-1111-111111111102"), new Guid("a1111111-a111-a111-a111-a11111111111"), "term-1", new Guid("33333333-3333-3333-3333-333333333303"), new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc), null, 100.00m, 120.00m, 0.00m, 0.00m, 220.00m, null, null, "Open", null }
            });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DeleteData(table: "ShiftTypes", keyColumn: "Id", keyValue: 1);
        migrationBuilder.DeleteData(table: "ShiftTypes", keyColumn: "Id", keyValue: 2);
        migrationBuilder.DeleteData(table: "ShiftTypes", keyColumn: "Id", keyValue: 3);
    }
}
