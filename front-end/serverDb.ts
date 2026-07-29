import { 
  Product, Coupon, Member, Order, Shift, DrawerOpenLog, 
  ShiftSchedule, ShiftSwapRequest, ProposedPO, StockBatch, 
  RoleRoutePermission, AttendanceRecord, LeaveRecord, MemberPromotion, CouponUsage, SystemAuditLog 
} from './src/types/pos';

export let products: Product[] = [
  {
    id: 'p1',
    sku: '0012',
    name: 'Mediterranean Salad',
    price: 14.5,
    category: 'Appetizers',
    stock: 35,
    minStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    id: 'p5',
    sku: '0087',
    name: 'Mixed Grill',
    price: 24.0,
    category: 'Main Course',
    stock: 3,
    minStockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    id: 'p7',
    sku: '0203',
    name: 'Iced Matcha Latte',
    price: 6.0,
    category: 'Beverages',
    stock: 2,
    minStockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },
  {
    id: 'p8',
    sku: '0319',
    name: 'Ribeye Steak 300g',
    price: 38.0,
    category: 'Main Course',
    stock: 4,
    minStockThreshold: 12,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  }
];

export let coupons: Coupon[] = [
  {
    id: 'c1',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 20.0,
    maxDiscountAmount: 15.0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    usageLimit: 1000,
    usedCount: 42,
    isActive: true,
    applicableProductIds: [],
  },
  {
    id: 'c2',
    code: 'FLASH5',
    discountType: 'fixed',
    discountValue: 5.0,
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
    applicableProductIds: ['p2'],
  }
];

export let members: Member[] = [
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
  }
];

export let roleRoutes: RoleRoutePermission[] = [
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
      '/admin/coupons',
      '/admin/members',
      '/admin/audit-logs',
      '/profile',
    ],
  }
];

export let shiftSchedules: ShiftSchedule[] = [
  {
    id: 'sch-1',
    employeeId: 'emp-101',
    employeeName: 'Sarah Jenkins (Cashier)',
    role: 'Cashier',
    date: '2026-07-25',
    shiftType: 'Morning',
    status: 'SCHEDULED',
    clockInTime: '06:03:12',
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
    clockInTime: '14:12:00',
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
  }
];

export let shiftSwaps: ShiftSwapRequest[] = [
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
  }
];

export let proposedPOs: ProposedPO[] = [
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
      }
    ],
    totalCost: 600.0,
    status: 'PROPOSED',
    createdAt: '2026-07-25 09:15:00',
  }
];

export let stockBatches: StockBatch[] = [
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
  }
];

export let attendance: AttendanceRecord[] = [
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
  }
];

export let leaves: LeaveRecord[] = [
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
  }
];

export let orders: Order[] = [];
export let shifts: Shift[] = [];
export let drawerOpenLogs: DrawerOpenLog[] = [];

export let promotions: MemberPromotion[] = [
  {
    id: 'promo-1',
    name: 'Gold Member Welcome Discount',
    promotionType: 'MinSpentDiscount',
    minSpentAmount: 100,
    minQuantity: 0,
    discountAmount: 10,
    freeQuantity: 0,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'promo-2',
    name: 'Latte Buy 2 Get 1 Free',
    promotionType: 'BuyXGetY',
    minSpentAmount: 0,
    minQuantity: 2,
    discountAmount: 0,
    freeProductId: 'p3', // Artisan Latte
    freeQuantity: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
  },
];

export let couponUsages: CouponUsage[] = [];

export let systemAuditLogs: SystemAuditLog[] = [
  {
    id: 'log-1',
    userId: '99999999-9999-9999-9999-999999999999', // admin
    action: 'USER_LOGIN',
    description: 'System Administrator logged in successfully from 192.168.1.100.',
    hmacSignature: '38a7852de9fbdf1890efd06371cf12c2864f19934273bb074900a69a08ebfa61',
    createdAt: '2026-07-29T08:00:00Z',
  },
  {
    id: 'log-2',
    userId: '11111111-d111-d111-d111-d11111111111', // cashier
    action: 'SUSPICIOUS_BEHAVIOR_FLAG',
    description: 'ShiftId: s-101 - Significant Cash Shortage: Missing -250.00 THB.',
    hmacSignature: '8ab4a0e28f14b2d18bc47e33527b1ee880cf5a7d6568b6ff9a34bc762b322a3d',
    createdAt: '2026-07-29T09:15:30Z',
  }
];
