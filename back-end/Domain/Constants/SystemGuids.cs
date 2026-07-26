// Domain/Constants/SystemGuids.cs
namespace Pos.Domain.Constants;

public static class SystemGuids
{
    public static class Roles
    {
        public static readonly Guid Admin = Guid.Parse("11111111-1111-1111-1111-111111111111");
        public static readonly Guid Cashier = Guid.Parse("22222222-2222-2222-2222-222222222222");
        public static readonly Guid BranchManager = Guid.Parse("33333333-3333-3333-3333-333333333333");
        public static readonly Guid Accountant = Guid.Parse("44444444-4444-4444-4444-444444444444");
        public static readonly Guid Vendor = Guid.Parse("55555555-5555-5555-5555-555555555555");
        public static readonly Guid PurchaserManager = Guid.Parse("66666666-6666-6666-6666-666666666666");
    }

    public static class Branches
    {
        public static readonly Guid HeadOffice = Guid.Parse("A1111111-A111-A111-A111-A11111111111");
    }

    public static class Warehouses
    {
        public static readonly Guid MainWarehouse = Guid.Parse("B1111111-B111-B111-B111-B11111111111");
    }

    public static class Users
    {
        public static readonly Guid SystemAdmin = Guid.Parse("99999999-9999-9999-9999-999999999999");
    }
}