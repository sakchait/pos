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
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<PosTerminal> PosTerminals => Set<PosTerminal>();
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

        // 1. Apply all entity configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // 2. Precision Settings (Decimal 18,2) - Global Fallback Configuration
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }
    }
}