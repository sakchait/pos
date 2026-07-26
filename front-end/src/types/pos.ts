export type UserRole =
  | 'Cashier'
  | 'BranchManager'
  | 'Accountant'
  | 'Vendor'
  | 'PurchaserManager'
  | 'Admin';

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  minStockThreshold: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedModifiers: string[];
  itemDiscount: number; // percentage or fixed amount
}

export type PaymentMethod = 'Cash' | 'CreditCard' | 'PromptPayQR' | 'GiftCard';

export interface OrderPayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNo: string;
  items: CartItem[];
  subtotal: number;
  vatRate: number; // e.g. 0.07 for 7%
  vatAmount: number;
  isVatInclusive: boolean;
  couponCode?: string;
  discountAmount: number;
  grandTotal: number;
  payments: OrderPayment[];
  status: 'COMPLETED' | 'VOIDED' | 'REFUNDED';
  createdAt: string;
  hmacSignature: string;
  cashierId: string;
  cashierName: string;
  memberId?: string;
  memberName?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  applicableProductIds: string[]; // empty means all products
}

export interface Member {
  id: string;
  memberNo: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  tier: 'Gold' | 'Platinum' | 'Silver' | 'Bronze';
  joinDate: string;
  favoriteItems: string[];
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  terminalId: string;
  openingTime: string;
  closingTime?: string;
  openingCash: number;
  systemCashSales: number;
  paidIn: number;
  paidOut: number;
  safeDrop: number;
  expectedCash?: number;
  actualCashCounted?: number;
  cashDifference?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface DrawerOpenLog {
  id: string;
  cashierId: string;
  cashierName: string;
  timestamp: string;
  reason: 'NO_SALE' | 'MANUAL_OPEN' | 'VOID_ORDER' | 'REFUND' | 'PRICE_OVERRIDE';
  managerApprovedBy?: string;
}

export type ShiftType = 'Morning' | 'Afternoon' | 'Night';

export interface ShiftSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  role: 'BranchManager' | 'Cashier';
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  status: 'SCHEDULED' | 'COMPLETED' | 'SWAP_PENDING';
  isHoliday?: boolean;
  clockInTime?: string;
  clockOutTime?: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;
  scheduleId: string;
  date: string;
  shiftType: ShiftType;
  status: 'PENDING' | 'ACCEPTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  managerNotes?: string;
}

export interface ProposedPO {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorContact: string;
  items: Array<{
    productId: string;
    productName: string;
    proposedQty: number;
    unitCost: number;
  }>;
  totalCost: number;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface StockBatch {
  id: string;
  productId: string;
  productName: string;
  batchNo: string;
  qtyReceived: number;
  qtyRemaining: number;
  unitCost: number;
  receivedDate: string;
  poNumber?: string;
}

export interface RoleRoutePermission {
  role: UserRole;
  routes: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualClockIn: string;
  actualClockOut: string;
  isLate: boolean;
  lateMinutes: number;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Sick' | 'Personal' | 'Annual';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}
