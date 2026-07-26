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
                FullName = "System Administrator",
                RoleId = SystemGuids.Roles.Admin,
                IsAdmin = true,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}