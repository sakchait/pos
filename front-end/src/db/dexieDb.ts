import Dexie, { Table } from 'dexie';
import {
  Product,
  Coupon,
  Member,
  Order,
  Shift,
  DrawerOpenLog,
  ShiftSchedule,
  ShiftSwapRequest,
  ProposedPO,
  StockBatch,
  RoleRoutePermission,
  AttendanceRecord,
  LeaveRecord,
} from '../types/pos';

export class OmniPOSDatabase extends Dexie {
  products!: Table<Product, string>;
  coupons!: Table<Coupon, string>;
  members!: Table<Member, string>;
  orders!: Table<Order, string>;
  shifts!: Table<Shift, string>;
  drawerOpenLogs!: Table<DrawerOpenLog, string>;
  shiftSchedules!: Table<ShiftSchedule, string>;
  shiftSwaps!: Table<ShiftSwapRequest, string>;
  proposedPOs!: Table<ProposedPO, string>;
  stockBatches!: Table<StockBatch, string>;
  roleRoutes!: Table<RoleRoutePermission, string>;
  attendance!: Table<AttendanceRecord, string>;
  leaves!: Table<LeaveRecord, string>;

  constructor() {
    super('OmniPOS_Enterprise_DB');
    this.version(1).stores({
      products: 'id, sku, category, price, stock, isAvailable',
      coupons: 'id, code, isActive',
      members: 'id, memberNo, phone, name',
      orders: 'id, orderNo, status, createdAt, cashierId, memberId',
      shifts: 'id, cashierId, status, openingTime',
      drawerOpenLogs: 'id, cashierId, timestamp, reason',
      shiftSchedules: 'id, employeeId, date, shiftType, status',
      shiftSwaps: 'id, requesterId, recipientId, status',
      proposedPOs: 'id, poNumber, status',
      stockBatches: 'id, productId, batchNo',
      roleRoutes: 'role',
      attendance: 'id, employeeId, date',
      leaves: 'id, employeeId, leaveType',
    });
  }
}

export const db = new OmniPOSDatabase();

/**
 * Initial Seed Data for Offline First Dexie Storage
 */
export async function seedInitialDataIfNeeded() {
  const productCount = await db.products.count();
  if (productCount > 0) return;

  // 1. Seed Products
  const initialProducts: Product[] = [
    {
      id: 'p1',
      sku: '0012',
      name: 'Mediterranean Salad',
      price: 14.5,
      category: 'Appetizers',
      stock: 35,
      minStockThreshold: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p2',
      sku: '0054',
      name: 'Signature Burger',
      price: 18.0,
      category: 'Main Course',
      stock: 42,
      minStockThreshold: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p3',
      sku: '0098',
      name: 'Artisan Latte',
      price: 5.25,
      category: 'Beverages',
      stock: 80,
      minStockThreshold: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p4',
      sku: '0112',
      name: 'Glazed Donut',
      price: 3.5,
      category: 'Desserts',
      stock: 50,
      minStockThreshold: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p5',
      sku: '0087',
      name: 'Mixed Grill',
      price: 24.0,
      category: 'Main Course',
      stock: 3, // Low stock / near threshold
      minStockThreshold: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p6',
      sku: '0041',
      name: 'Truffle Fries',
      price: 8.5,
      category: 'Appetizers',
      stock: 65,
      minStockThreshold: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p7',
      sku: '0203',
      name: 'Iced Matcha Latte',
      price: 6.0,
      category: 'Beverages',
      stock: 2, // Low stock alert!
      minStockThreshold: 10,
      imageUrl:
        'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      id: 'p8',
      sku: '0319',
      name: 'Ribeye Steak 300g',
      price: 38.0,
      category: 'Main Course',
      stock: 4, // Low stock alert!
      minStockThreshold: 12,
      imageUrl:
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
  ];
  await db.products.bulkAdd(initialProducts);

  // 2. Seed Coupons
  const initialCoupons: Coupon[] = [
    {
      id: 'c1',
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10, // 10% off
      minOrderAmount: 20.0,
      maxDiscountAmount: 15.0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      usageLimit: 1000,
      usedCount: 42,
      isActive: true,
      applicableProductIds: [], // All products
    },
    {
      id: 'c2',
      code: 'FLASH5',
      discountType: 'fixed',
      discountValue: 5.0, // $5 off
      minOrderAmount: 30.0,
      maxDiscountAmount: 5.0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      usageLimit: 500,
      usedCount: 18,
      isActive: true,
      applicableProductIds: [],
    },
    {
      id: 'c3',
      code: 'VIPBURGER',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 15.0,
      maxDiscountAmount: 10.0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      usageLimit: 200,
      usedCount: 5,
      isActive: true,
      applicableProductIds: ['p2'], // Specific to Signature Burger
    },
  ];
  await db.coupons.bulkAdd(initialCoupons);

  // 3. Seed Members
  const initialMembers: Member[] = [
    {
      id: 'm1',
      memberNo: 'M-1001',
      name: 'Sarah Jenkins',
      phone: '0812345678',
      email: 'sarah.j@example.com',
      points: 540,
      tier: 'Gold',
      joinDate: '2024-03-15',
      favoriteItems: ['Artisan Latte', 'Signature Burger'],
    },
    {
      id: 'm2',
      memberNo: 'M-1002',
      name: 'Alex Rivera',
      phone: '0898765432',
      email: 'alex.r@example.com',
      points: 1250,
      tier: 'Platinum',
      joinDate: '2023-11-20',
      favoriteItems: ['Ribeye Steak 300g', 'Mediterranean Salad'],
    },
  ];
  await db.members.bulkAdd(initialMembers);

  // 4. Seed Role Routes
  const initialRoleRoutes: RoleRoutePermission[] = [
    {
      role: 'Cashier',
      routes: ['/pos', '/shifts', '/profile'],
    },
    {
      role: 'BranchManager',
      routes: ['/pos', '/shifts', '/reports', '/profile'],
    },
    {
      role: 'Accountant',
      routes: ['/reports', '/vendor', '/profile'],
    },
    {
      role: 'Vendor',
      routes: ['/vendor', '/profile'],
    },
    {
      role: 'PurchaserManager',
      routes: ['/vendor', '/inventory', '/profile'],
    },
    {
      role: 'Admin',
      routes: [
        '/pos',
        '/shifts',
        '/shifts/schedule',
        '/vendor',
        '/reports',
        '/admin/roles',
        '/profile',
      ],
    },
  ];
  await db.roleRoutes.bulkAdd(initialRoleRoutes);

  // 5. Seed Shift Schedules for Schedule & Swaps Module
  const initialSchedules: ShiftSchedule[] = [
    {
      id: 'sch-1',
      employeeId: 'emp-101',
      employeeName: 'Sarah Jenkins (Cashier)',
      role: 'Cashier',
      date: '2026-07-25',
      shiftType: 'Morning',
      status: 'SCHEDULED',
      clockInTime: '06:03:12', // Late by 3 mins
      clockOutTime: '14:00:00',
    },
    {
      id: 'sch-2',
      employeeId: 'emp-102',
      employeeName: 'John Doe (Branch Manager)',
      role: 'BranchManager',
      date: '2026-07-25',
      shiftType: 'Morning',
      status: 'SCHEDULED',
      clockInTime: '05:55:00',
      clockOutTime: '14:05:00',
    },
    {
      id: 'sch-3',
      employeeId: 'emp-103',
      employeeName: 'Michael Chang (Cashier)',
      role: 'Cashier',
      date: '2026-07-25',
      shiftType: 'Afternoon',
      status: 'SCHEDULED',
      clockInTime: '14:12:00', // Late by 12 mins!
      clockOutTime: '22:00:00',
    },
    {
      id: 'sch-4',
      employeeId: 'emp-104',
      employeeName: 'Elena Rostova (Cashier)',
      role: 'Cashier',
      date: '2026-07-25',
      shiftType: 'Night',
      status: 'SCHEDULED',
      isHoliday: true,
      clockInTime: '22:00:00',
      clockOutTime: '06:00:00',
    },
  ];
  await db.shiftSchedules.bulkAdd(initialSchedules);

  // 6. Seed Shift Swap Requests
  const initialSwaps: ShiftSwapRequest[] = [
    {
      id: 'swap-1',
      requesterId: 'emp-101',
      requesterName: 'Sarah Jenkins',
      recipientId: 'emp-103',
      recipientName: 'Michael Chang',
      scheduleId: 'sch-1',
      date: '2026-07-26',
      shiftType: 'Morning',
      status: 'PENDING',
      createdAt: '2026-07-25 10:30:00',
    },
  ];
  await db.shiftSwaps.bulkAdd(initialSwaps);

  // 7. Seed Proposed POs for Vendor Portal
  const initialPOs: ProposedPO[] = [
    {
      id: 'po-101',
      poNumber: 'PO-2026-0881',
      vendorName: 'Fresh Harvest Farms Co.',
      vendorContact: 'vendor@freshharvest.com',
      items: [
        {
          productId: 'p7',
          productName: 'Iced Matcha Latte (Ceremonial Grade powder)',
          proposedQty: 50,
          unitCost: 2.8,
        },
        {
          productId: 'p5',
          productName: 'Mixed Grill Skewers (Marinated Beef & Lamb)',
          proposedQty: 40,
          unitCost: 11.5,
        },
      ],
      totalCost: 600.0,
      status: 'PROPOSED',
      createdAt: '2026-07-25 09:15:00',
    },
  ];
  await db.proposedPOs.bulkAdd(initialPOs);

  // 8. Seed Stock Batches for FIFO Tracking
  const initialBatches: StockBatch[] = [
    {
      id: 'batch-001',
      productId: 'p2',
      productName: 'Signature Burger (Angus Beef Patty)',
      batchNo: 'BATCH-20260701-A',
      qtyReceived: 50,
      qtyRemaining: 42,
      unitCost: 8.0,
      receivedDate: '2026-07-01',
      poNumber: 'PO-2026-0701',
    },
    {
      id: 'batch-002',
      productId: 'p8',
      productName: 'Ribeye Steak 300g',
      batchNo: 'BATCH-20260710-B',
      qtyReceived: 20,
      qtyRemaining: 4,
      unitCost: 19.5,
      receivedDate: '2026-07-10',
      poNumber: 'PO-2026-0710',
    },
  ];
  await db.stockBatches.bulkAdd(initialBatches);

  // 9. Seed Attendance and Leaves
  const initialAttendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      employeeId: 'emp-101',
      employeeName: 'Sarah Jenkins',
      date: '2026-07-25',
      scheduledStart: '06:00',
      scheduledEnd: '14:00',
      actualClockIn: '06:08',
      actualClockOut: '14:02',
      isLate: true,
      lateMinutes: 8,
    },
    {
      id: 'att-2',
      employeeId: 'emp-103',
      employeeName: 'Michael Chang',
      date: '2026-07-25',
      scheduledStart: '14:00',
      scheduledEnd: '22:00',
      actualClockIn: '14:14',
      actualClockOut: '22:05',
      isLate: true,
      lateMinutes: 14,
    },
    {
      id: 'att-3',
      employeeId: 'emp-102',
      employeeName: 'John Doe',
      date: '2026-07-25',
      scheduledStart: '06:00',
      scheduledEnd: '14:00',
      actualClockIn: '05:54',
      actualClockOut: '14:00',
      isLate: false,
      lateMinutes: 0,
    },
  ];
  await db.attendance.bulkAdd(initialAttendance);

  const initialLeaves: LeaveRecord[] = [
    {
      id: 'leave-1',
      employeeId: 'emp-105',
      employeeName: 'David Vance',
      leaveType: 'Sick',
      startDate: '2026-07-20',
      endDate: '2026-07-21',
      daysCount: 2,
      status: 'APPROVED',
    },
    {
      id: 'leave-2',
      employeeId: 'emp-101',
      employeeName: 'Sarah Jenkins',
      leaveType: 'Annual',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      daysCount: 5,
      status: 'APPROVED',
    },
  ];
  await db.leaves.bulkAdd(initialLeaves);
}

/**
 * Coupon Validation Helper against Dexie `coupons` table
 */
export async function validateCouponCode(
  code: string,
  subtotal: number,
  cartProductIds: string[]
): Promise<{
  isValid: boolean;
  coupon?: Coupon;
  calculatedDiscount: number;
  message: string;
}> {
  const coupon = await db.coupons.where('code').equalsIgnoreCase(code).first();

  if (!coupon) {
    return { isValid: false, calculatedDiscount: 0, message: 'Invalid coupon code.' };
  }

  // 1. isActive === true
  if (!coupon.isActive) {
    return { isValid: false, coupon, calculatedDiscount: 0, message: 'Coupon is inactive.' };
  }

  // 2. now >= startDate and now <= endDate
  const todayStr = new Date().toISOString().split('T')[0];
  if (todayStr < coupon.startDate || todayStr > coupon.endDate) {
    return {
      isValid: false,
      coupon,
      calculatedDiscount: 0,
      message: `Coupon is valid only from ${coupon.startDate} to ${coupon.endDate}.`,
    };
  }

  // 3. usedCount < usageLimit
  if (coupon.usedCount >= coupon.usageLimit) {
    return {
      isValid: false,
      coupon,
      calculatedDiscount: 0,
      message: 'Coupon usage limit has been reached.',
    };
  }

  // 4. Cart subtotal meets minOrderAmount
  if (subtotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      coupon,
      calculatedDiscount: 0,
      message: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required.`,
    };
  }

  // 5. Check applicableProductIds (if non-empty)
  if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
    const hasApplicableProduct = cartProductIds.some((id) =>
      coupon.applicableProductIds.includes(id)
    );
    if (!hasApplicableProduct) {
      return {
        isValid: false,
        coupon,
        calculatedDiscount: 0,
        message: 'Coupon is not applicable to any items in the cart.',
      };
    }
  }

  // Calculate discount amount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  // Apply maxDiscountAmount cap
  if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }

  return {
    isValid: true,
    coupon,
    calculatedDiscount: Math.min(discount, subtotal),
    message: `Coupon ${coupon.code} applied successfully!`,
  };
}
