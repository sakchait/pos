// Infrastructure/Persistence/ApplicationDbContext.cs
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;
using Pos.Domain.Constants;
using Pos.Domain.Entities;

namespace Pos.Domain.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // Core POS & Inventory
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<WarehouseInventory> WarehouseInventories => Set<WarehouseInventory>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderPayment> OrderPayments => Set<OrderPayment>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    // Vendor & FIFO
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();
    public DbSet<StockBatch> StockBatches => Set<StockBatch>();

    // Shifts & Anti-Fraud Logs
    public DbSet<CashierShift> CashierShifts => Set<CashierShift>();
    public DbSet<DrawerDropTransaction> DrawerDropTransactions => Set<DrawerDropTransaction>();
    public DbSet<DrawerOpenLog> DrawerOpenLogs => Set<DrawerOpenLog>();
    public DbSet<VoidLog> VoidLogs => Set<VoidLog>();
    public DbSet<SystemAuditLog> SystemAuditLogs => Set<SystemAuditLog>();

    // Shift Scheduling & Attendance
    public DbSet<ShiftType> ShiftTypes => Set<ShiftType>();
    public DbSet<ShiftSchedule> ShiftSchedules => Set<ShiftSchedule>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<ShiftSwapRequest> ShiftSwapRequests => Set<ShiftSwapRequest>();
    public DbSet<PublicHoliday> PublicHolidays => Set<PublicHoliday>();

    // Members, Promotions & AI
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<MemberPromotion> MemberPromotions => Set<MemberPromotion>();
    public DbSet<ProductAssociation> ProductAssociations => Set<ProductAssociation>();
    public DbSet<MemberAiRecommendation> MemberAiRecommendations => Set<MemberAiRecommendation>();

    // Auth & Access Control
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RoleRoutePermission> RoleRoutePermissions => Set<RoleRoutePermission>();
    public DbSet<RoleChangeAuditLog> RoleChangeAuditLogs => Set<RoleChangeAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Composite Key for WarehouseInventories
        modelBuilder.Entity<WarehouseInventory>()
            .HasKey(wi => new { wi.WarehouseId, wi.ProductId });

        // 2. Indexes for Performance
        modelBuilder.Entity<Product>().HasIndex(p => p.Code).IsUnique();
        modelBuilder.Entity<Order>().HasIndex(o => o.OrderNo).IsUnique();
        modelBuilder.Entity<Order>().HasIndex(o => o.CreatedAt);
        modelBuilder.Entity<Order>().HasIndex(o => o.SyncStatus);
        modelBuilder.Entity<Branch>().HasIndex(b => b.Code).IsUnique();
        modelBuilder.Entity<Vendor>().HasIndex(v => v.TaxId).IsUnique();
        modelBuilder.Entity<PurchaseOrder>().HasIndex(po => po.PoNumber).IsUnique();
        modelBuilder.Entity<Member>().HasIndex(m => m.PhoneNumber).IsUnique();
        modelBuilder.Entity<Member>().HasIndex(m => m.MemberNo).IsUnique();
        modelBuilder.Entity<Coupon>().HasKey(c => c.Code);
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

        // 3. Precision Settings (Decimal 18,2)
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // 4. Relationships Configurations
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.OrderId);
            entity.HasMany(e => e.Payments).WithOne().HasForeignKey(p => p.OrderId);
            entity.HasOne(e => e.CouponUsage).WithOne().HasForeignKey<CouponUsage>(c => c.OrderId);
            entity.HasOne(e => e.Member).WithMany().HasForeignKey(e => e.MemberId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasMany(e => e.Items).WithOne().HasForeignKey(i => i.PurchaseOrderId);
        });

        modelBuilder.Entity<ProductAssociation>(entity =>
        {
            entity.HasOne(pa => pa.PrimaryProduct)
                .WithMany()
                .HasForeignKey(pa => pa.PrimaryProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(pa => pa.RecommendedProduct)
                .WithMany()
                .HasForeignKey(pa => pa.RecommendedProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ShiftSwapRequest>(entity =>
        {
            entity.HasOne(sr => sr.RequestorShift)
                .WithMany()
                .HasForeignKey(sr => sr.RequestorShiftId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // 5. Seed Initial Default Data
        SeedDefaultData(modelBuilder);
    }

    private static void SeedDefaultData(ModelBuilder modelBuilder)
    {
        // Seed Standard Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = SystemGuids.Roles.Admin, Name = "Admin" },
            new Role { Id = SystemGuids.Roles.Cashier, Name = "Cashier" },
            new Role { Id = SystemGuids.Roles.BranchManager, Name = "BranchManager" },
            new Role { Id = SystemGuids.Roles.Accountant, Name = "Accountant" },
            new Role { Id = SystemGuids.Roles.Vendor, Name = "Vendor" },
            new Role { Id = SystemGuids.Roles.PurchaserManager, Name = "PurchaserManager" },
            new Role { Id = SystemGuids.Roles.StockClerk, Name = "StockClerk" }
        );

        // Seed Default Shift Types
        modelBuilder.Entity<ShiftType>().HasData(
            new ShiftType { Id = 1, Name = "กะเช้า", StartTime = new TimeSpan(6, 0, 0), EndTime = new TimeSpan(14, 0, 0) },
            new ShiftType { Id = 2, Name = "กะบ่าย", StartTime = new TimeSpan(14, 0, 0), EndTime = new TimeSpan(22, 0, 0) },
            new ShiftType { Id = 3, Name = "กะดึก", StartTime = new TimeSpan(22, 0, 0), EndTime = new TimeSpan(6, 0, 0) }
        );

        // Seed System Admin User
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = SystemGuids.Users.SystemAdmin,
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"), // Default Admin Password
                PinHash = BCrypt.Net.BCrypt.HashPassword("9999"),
                FullName = "System Administrator",
                RoleId = SystemGuids.Roles.Admin,
                IsAdmin = true,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Branch Manager User (Sarah Jenkins)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333334"),
                Username = "sarah.jenkins",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Sarah Jenkins",
                RoleId = SystemGuids.Roles.BranchManager,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
                Username = "alex.rivera",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Alex Rivera",
                RoleId = SystemGuids.Roles.Cashier,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333303"),
                Username = "mark.tanaka",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Mark Tanaka",
                RoleId = SystemGuids.Roles.StockClerk,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333304"),
                Username = "purchaser.admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                PinHash = BCrypt.Net.BCrypt.HashPassword("1234"),
                FullName = "Elena Rostova",
                RoleId = SystemGuids.Roles.PurchaserManager,
                BranchId = SystemGuids.Branches.HeadOffice,
                IsAdmin = false,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Coupons
        modelBuilder.Entity<Coupon>().HasData(
            new Coupon
            {
                Code = "WELCOME10",
                Description = "10% Welcome Discount",
                DiscountType = "Percentage",
                DiscountValue = 10m,
                MinOrderAmount = 20.0m,
                MaxDiscountAmount = 15.0m,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                UsageLimit = 1000,
                UsedCount = 42,
                IsActive = true,
                ApplicableProductIdsJson = "[]",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Coupon
            {
                Code = "FLASH5",
                Description = "$5 off on order above $30",
                DiscountType = "Fixed",
                DiscountValue = 5.0m,
                MinOrderAmount = 30.0m,
                MaxDiscountAmount = 5.0m,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                UsageLimit = 500,
                UsedCount = 18,
                IsActive = true,
                ApplicableProductIdsJson = "[]",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Coupon
            {
                Code = "VIPBURGER",
                Description = "20% off on Burger combos",
                DiscountType = "Percentage",
                DiscountValue = 20m,
                MinOrderAmount = 15.0m,
                MaxDiscountAmount = 10.0m,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                UsageLimit = 100,
                UsedCount = 5,
                IsActive = true,
                ApplicableProductIdsJson = "[]",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Products
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111101"),
                Code = "0012",
                Name = "Mediterranean Salad",
                Price = 14.50m,
                StandardCost = 5.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 35
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111102"),
                Code = "0054",
                Name = "Signature Burger",
                Price = 18.00m,
                StandardCost = 6.50m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 42
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111103"),
                Code = "0098",
                Name = "Artisan Latte",
                Price = 5.25m,
                StandardCost = 1.50m,
                MinStockThreshold = 20,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 80
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111104"),
                Code = "0112",
                Name = "Glazed Donut",
                Price = 3.50m,
                StandardCost = 1.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 50
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111105"),
                Code = "0087",
                Name = "Mixed Grill",
                Price = 24.00m,
                StandardCost = 9.00m,
                MinStockThreshold = 8,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 3
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111106"),
                Code = "0041",
                Name = "Truffle Fries",
                Price = 8.50m,
                StandardCost = 2.50m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 65
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111107"),
                Code = "0203",
                Name = "Iced Matcha Latte",
                Price = 6.00m,
                StandardCost = 2.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 2
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111108"),
                Code = "0319",
                Name = "Ribeye Steak 300g",
                Price = 38.00m,
                StandardCost = 15.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 4
            }
        );

        // Seed Shift Schedules
        modelBuilder.Entity<ShiftSchedule>().HasData(
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444401"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 1, // Morning
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "Cashier"
            },
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444402"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333302"), // Alex Rivera
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 1, // Morning
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "BranchManager"
            },
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444403"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 2, // Afternoon
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "Cashier"
            },
            new ShiftSchedule
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444404"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333304"), // Elena Rostova
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                ShiftTypeId = 3, // Night
                WorkDate = new DateTime(2026, 7, 25, 0, 0, 0, DateTimeKind.Utc),
                Status = "Scheduled",
                RoleInShift = "Cashier"
            }
        );

        // Seed Shift Swap Requests
        modelBuilder.Entity<ShiftSwapRequest>().HasData(
            new ShiftSwapRequest
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555501"),
                RequestorShiftId = Guid.Parse("44444444-4444-4444-4444-444444444401"),
                TargetUserId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                Reason = "Family emergency",
                Status = "PendingPeer",
                CreatedAt = new DateTime(2026, 7, 25, 10, 30, 0, DateTimeKind.Utc)
            }
        );

        // Seed Warehouse
        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse
            {
                Id = Guid.Parse("b1111111-b111-b111-b111-b11111111111"),
                BranchId = Guid.Parse("a1111111-a111-a111-a111-a11111111111"),
                Name = "Main Warehouse",
                IsMainWarehouse = true
            }
        );

        // Seed Vendor
        modelBuilder.Entity<Vendor>().HasData(
            new Vendor
            {
                Id = Guid.Parse("d1111111-d111-d111-d111-d11111111111"),
                TaxId = "0105551234599",
                Name = "Global Foods Co.",
                ContactPerson = "Jane Smith",
                Email = "vendor@globalfoods.com",
                Phone = "0819876543",
                IsActive = true
            }
        );

        // Seed Purchase Order (Proposed)
        modelBuilder.Entity<PurchaseOrder>().HasData(
            new PurchaseOrder
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666601"),
                PoNumber = "PO-20260725-01",
                VendorId = Guid.Parse("d1111111-d111-d111-d111-d11111111111"),
                WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"),
                TotalAmount = 54.00m,
                Status = "Proposed",
                ProposedByVendor = true,
                CreatedAt = new DateTime(2026, 7, 25, 8, 30, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<PurchaseOrderItem>().HasData(
            new PurchaseOrderItem
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666602"),
                PurchaseOrderId = Guid.Parse("66666666-6666-6666-6666-666666666601"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111102"), // Signature Burger
                Quantity = 3,
                UnitPrice = 18.00m,
                SubTotal = 54.00m
            }
        );

        // Seed Stock Batch
        modelBuilder.Entity<StockBatch>().HasData(
            new StockBatch
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777701"),
                WarehouseId = Guid.Parse("b1111111-b111-b111-b111-b11111111111"),
                ProductId = Guid.Parse("11111111-1111-1111-1111-111111111102"), // Signature Burger
                PurchaseOrderId = Guid.Empty,
                BatchNumber = "BATCH-INITIAL-01",
                UnitCost = 6.50m,
                InitialQuantity = 50,
                RemainingQuantity = 42,
                ReceivedDate = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
                ExpiryDate = new DateTime(2027, 7, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Attendances
        modelBuilder.Entity<Attendance>().HasData(
            new Attendance
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888801"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                ClockIn = new DateTime(2026, 7, 25, 6, 8, 0, DateTimeKind.Utc),
                ClockOut = new DateTime(2026, 7, 25, 14, 2, 0, DateTimeKind.Utc)
            },
            new Attendance
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888802"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333303"), // Mark Tanaka
                ClockIn = new DateTime(2026, 7, 25, 14, 14, 0, DateTimeKind.Utc),
                ClockOut = new DateTime(2026, 7, 25, 22, 5, 0, DateTimeKind.Utc)
            },
            new Attendance
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888803"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333302"), // Alex Rivera
                ClockIn = new DateTime(2026, 7, 25, 5, 54, 0, DateTimeKind.Utc),
                ClockOut = new DateTime(2026, 7, 25, 14, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed Leave Requests
        modelBuilder.Entity<LeaveRequest>().HasData(
            new LeaveRequest
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999901"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333304"), // Elena Rostova
                LeaveType = "SickLeave",
                StartDate = new DateTime(2026, 7, 20, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 7, 21, 0, 0, 0, DateTimeKind.Utc),
                Reason = "High fever and flu",
                Status = "Approved"
            },
            new LeaveRequest
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999902"),
                UserId = Guid.Parse("33333333-3333-3333-3333-333333333334"), // Sarah Jenkins
                LeaveType = "AnnualLeave",
                StartDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 8, 5, 0, 0, 0, DateTimeKind.Utc),
                Reason = "Family vacation",
                Status = "Approved"
            }
        );
    }
}