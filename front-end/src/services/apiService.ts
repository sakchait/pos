"use server";

import { db, validateCouponCode } from '../db/dexieDb';
import {
  Product, Coupon, Member, Order, Shift, DrawerOpenLog,
  ShiftSchedule, ShiftSwapRequest, ProposedPO, StockBatch,
  RoleRoutePermission, AttendanceRecord, LeaveRecord, UserRole, UserAccount, MemberPromotion
} from '../types/pos';

const USE_SERVICES = import.meta.env.VITE_USE_SERVICES === 'true';
const API_BASE = '/api';
const X_FUNCTION_KEY = import.meta.env.VITE_API_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${API_BASE}${path}`;
  let bodyLog: any = '';
  if (options?.body) {
    try {
      bodyLog = JSON.parse(options.body as string);
    } catch {
      bodyLog = options.body;
    }
  }
  console.log(`[apiFetch] Request: ${options?.method || 'GET'} ${url}`, bodyLog);

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': X_FUNCTION_KEY || "",
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    console.error(`[apiFetch] Response Error: ${res.status} ${res.statusText} for ${url}`);
    throw new Error(`API Error: ${res.statusText}`);
  }
  const data = await res.json();
  console.log(`[apiFetch] Response Success from ${url}:`, data);
  return data;
}

export const apiService = {
  isUsingServices(): boolean {
    return USE_SERVICES;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    if (USE_SERVICES) {
      return apiFetch<Product[]>('/products');
    } else {
      return db.products.toArray();
    }
  },
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } else {
      await db.products.update(id, updates);
    }
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    if (USE_SERVICES) {
      return apiFetch<Coupon[]>('/coupons');
    } else {
      return db.coupons.toArray();
    }
  },
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } else {
      await db.coupons.update(id, updates);
    }
  },
  async createCoupon(coupon: Coupon): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch('/coupons', { method: 'POST', body: JSON.stringify(coupon) });
    } else {
      await db.coupons.add(coupon);
    }
  },
  async deleteCoupon(code: string): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/coupons/${code}`, { method: 'DELETE' });
    } else {
      await db.coupons.delete(code);
    }
  },
  async findCouponByCode(code: string): Promise<Coupon | undefined> {
    if (USE_SERVICES) {
      const coupon = await apiFetch<Coupon | null>(`/coupons/code/${code}`);
      return coupon || undefined;
    } else {
      return db.coupons.where('code').equalsIgnoreCase(code).first();
    }
  },
  async validateCoupon(code: string, subtotal: number, cartProductIds: string[]): Promise<{
    isValid: boolean;
    coupon?: Coupon;
    calculatedDiscount: number;
    message: string;
  }> {
    if (USE_SERVICES) {
      return apiFetch<{
        isValid: boolean;
        coupon?: Coupon;
        calculatedDiscount: number;
        message: string;
      }>('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal, cartProductIds })
      });
    } else {
      return validateCouponCode(code, subtotal, cartProductIds);
    }
  },

  // Members
  async getMembers(): Promise<Member[]> {
    if (USE_SERVICES) {
      return apiFetch<Member[]>('/members');
    } else {
      return db.members.toArray();
    }
  },
  async findMemberByPhoneOrNo(query: string): Promise<Member | undefined> {
    if (USE_SERVICES) {
      const member = await apiFetch<Member | null>(`/members/search?q=${encodeURIComponent(query)}`);
      return member || undefined;
    } else {
      return db.members
        .where('phone')
        .equalsIgnoreCase(query)
        .or('memberNo')
        .equalsIgnoreCase(query)
        .first();
    }
  },
  async updateMember(id: string, updates: Partial<Member>): Promise<void> {
    if (USE_SERVICES) {
      const dto = {
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        points: updates.points,
        totalSpent: updates.totalSpent,
        tier: updates.tier
      };
      await apiFetch(`/members/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
    } else {
      await db.members.update(id, updates);
    }
  },
  async createMember(member: Omit<Member, 'id' | 'memberNo' | 'joinDate'>): Promise<Member> {
    if (USE_SERVICES) {
      const dto = {
        name: member.name,
        phone: member.phone,
        email: member.email,
        points: member.points || 0,
        totalSpent: member.totalSpent || 0,
        tier: member.tier || 'Standard'
      };
      return apiFetch<Member>('/members', { method: 'POST', body: JSON.stringify(dto) });
    } else {
      const newId = `m-${Date.now()}`;
      const sequence = (await db.members.count()) + 1003;
      const newMember: Member = {
        ...member,
        id: newId,
        memberNo: `M-${sequence}`,
        joinDate: new Date().toISOString().split('T')[0],
      };
      await db.members.add(newMember);
      return newMember;
    }
  },
  async deleteMember(id: string): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/members/${id}`, { method: 'DELETE' });
    } else {
      await db.members.delete(id);
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    if (USE_SERVICES) {
      return apiFetch<Order[]>('/orders');
    } else {
      return db.orders.toArray();
    }
  },
  async addOrder(order: Order): Promise<void> {
    // Always save to IndexedDB first so local order counts/records are consistent
    await db.orders.add(order);

    if (USE_SERVICES) {
      await apiFetch('/orders', { method: 'POST', body: JSON.stringify(order) });
      // Sync order to C# backend
      try {
        await apiFetch('/Sync/orders', {
          method: 'POST',
          body: JSON.stringify([{
            id: order.id,
            orderNo: order.orderNo,
            branchId: order.branchId,
            posTerminalId: order.posTerminalId,
            totalAmount: order.grandTotal,
            paymentMethod: order.payments[0]?.method || 'Cash',
            createdAt: new Date(order.createdAt).toISOString(),
            couponCode: order.couponCode,
            discountAmount: order.discountAmount,
            items: order.items.map(item => ({
              productId: item.product.id,
              unitPrice: item.product.price,
              quantity: item.quantity,
              subTotal: item.subtotal,
              vatAmount: item.vatAmount,
              itemDiscount: item.itemDiscount
            }))
          }])
        });
      } catch (e) {
        console.error('Failed to sync order to C# backend:', e);
      }
    }
  },

  // Shifts
  async getActiveShift(cashierId: string): Promise<Shift | undefined> {
    if (USE_SERVICES) {
      const shift = await apiFetch<Shift | null>(`/shifts/active?cashierId=${cashierId}`);
      return shift || undefined;
    } else {
      return db.shifts
        .where('cashierId')
        .equals(cashierId)
        .and(s => s.status === 'OPEN')
        .first();
    }
  },
  async addShift(shift: Shift): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch('/shifts', { method: 'POST', body: JSON.stringify(shift) });
    } else {
      await db.shifts.add(shift);
    }
  },
  async updateShift(id: string, updates: Partial<Shift>): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } else {
      await db.shifts.update(id, updates);
    }
  },

  // Drawer Open Logs
  async getDrawerLogs(): Promise<DrawerOpenLog[]> {
    if (USE_SERVICES) {
      return apiFetch<DrawerOpenLog[]>('/drawer-logs');
    } else {
      return db.drawerOpenLogs.toArray();
    }
  },
  async addDrawerLog(log: DrawerOpenLog): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch('/drawer-logs', { method: 'POST', body: JSON.stringify(log) });
    } else {
      await db.drawerOpenLogs.add(log);
    }
  },

  // Shift Schedules
  async getSchedules(): Promise<ShiftSchedule[]> {
    if (USE_SERVICES) {
      return apiFetch<ShiftSchedule[]>('/schedules');
    } else {
      return db.shiftSchedules.toArray();
    }
  },
  async addSchedule(schedule: ShiftSchedule): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch('/schedules', { method: 'POST', body: JSON.stringify(schedule) });
    } else {
      await db.shiftSchedules.add(schedule);
    }
  },
  async updateSchedule(id: string, updates: Partial<ShiftSchedule>): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } else {
      await db.shiftSchedules.update(id, updates);
    }
  },

  // Shift Swaps
  async getSwaps(): Promise<ShiftSwapRequest[]> {
    if (USE_SERVICES) {
      return apiFetch<ShiftSwapRequest[]>('/swaps');
    } else {
      return db.shiftSwaps.toArray();
    }
  },
  async addSwap(swap: ShiftSwapRequest): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch('/swaps', { method: 'POST', body: JSON.stringify(swap) });
    } else {
      await db.shiftSwaps.add(swap);
    }
  },
  async updateSwap(id: string, updates: Partial<ShiftSwapRequest>): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/swaps/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } else {
      await db.shiftSwaps.update(id, updates);
    }
  },

  // Proposed POs (Vendor)
  async getProposedPOs(): Promise<ProposedPO[]> {
    if (USE_SERVICES) {
      const raw = await apiFetch<any[]>('/proposed-pos');
      return raw.map(po => ({
        id: po.id,
        poNumber: po.poNumber,
        vendorName: po.vendorName,
        vendorContact: 'orders@supplier.com',
        items: (po.items || []).map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          proposedQty: item.quantity || 0,
          unitCost: item.price || 0
        })),
        totalCost: po.totalAmount || 0,
        status: po.status,
        createdAt: po.createdAt
      }));
    } else {
      return db.proposedPOs.toArray();
    }
  },
  async addProposedPO(po: ProposedPO): Promise<void> {
    if (USE_SERVICES) {
      const payload = {
        id: po.id.startsWith('po-') ? crypto.randomUUID() : po.id,
        poNumber: po.poNumber,
        vendorId: 'd1111111-d111-d111-d111-d11111111111', // seeded Global Foods Co.
        totalAmount: po.totalCost,
        status: po.status,
        items: po.items.map(item => ({
          productId: item.productId,
          quantity: item.proposedQty,
          price: item.unitCost
        }))
      };
      await apiFetch('/proposed-pos', { method: 'POST', body: JSON.stringify(payload) });
    } else {
      await db.proposedPOs.add(po);
    }
  },
  async updateProposedPO(id: string, updates: Partial<ProposedPO>): Promise<void> {
    if (USE_SERVICES) {
      await apiFetch(`/proposed-pos/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      // Call C# Backend approve endpoint if status is APPROVED
      if (updates.status === 'APPROVED') {
        try {
          await apiFetch(`/PurchaseOrders/approve/${id}`, { method: 'POST' });
        } catch (e) {
          console.error('Failed to call C# PO approve API:', e);
        }
      }
    } else {
      await db.proposedPOs.update(id, updates);
    }
  },

  // Stock Batches
  async getStockBatches(): Promise<StockBatch[]> {
    if (USE_SERVICES) {
      const raw = await apiFetch<any[]>('/stock-batches');
      return raw.map(b => ({
        id: b.id,
        productId: b.productId,
        productName: b.productName,
        batchNo: b.batchNo,
        qtyReceived: b.initialQuantity || 0,
        qtyRemaining: b.remainingQuantity || 0,
        unitCost: b.unitCost || 0,
        receivedDate: b.receivedDate
      }));
    } else {
      return db.stockBatches.toArray();
    }
  },
  async addStockBatch(batch: StockBatch): Promise<void> {
    if (USE_SERVICES) {
      const payload = {
        id: batch.id.startsWith('batch-') ? crypto.randomUUID() : batch.id,
        productId: batch.productId,
        batchNo: batch.batchNo,
        unitCost: batch.unitCost,
        initialQuantity: batch.qtyReceived,
        remainingQuantity: batch.qtyRemaining,
        receivedDate: batch.receivedDate,
        expiryDate: new Date(new Date(batch.receivedDate).setFullYear(new Date(batch.receivedDate).getFullYear() + 1)).toISOString().split('T')[0]
      };
      await apiFetch('/stock-batches', { method: 'POST', body: JSON.stringify(payload) });
    } else {
      await db.stockBatches.add(batch);
    }
  },

  // Role Route Permissions
  async getRoleRoutes(): Promise<RoleRoutePermission[]> {
    if (USE_SERVICES) {
      try {
        const response = await apiFetch<any[]>('/admin/AdminRoles');
        return response.map(r => ({
          role: r.roleName,
          routes: r.allowedRoutes
        }));
      } catch (e) {
        console.error('Failed to load roles from C# backend, falling back to local Express:', e);
        return apiFetch<RoleRoutePermission[]>('/role-routes');
      }
    } else {
      return db.roleRoutes.toArray();
    }
  },
  async updateRoleRoute(role: string, routes: string[]): Promise<void> {
    if (USE_SERVICES) {
      try {
        const roles = await apiFetch<any[]>('/admin/AdminRoles');
        const found = roles.find(r => r.roleName === role);
        if (found) {
          await apiFetch('/admin/AdminRoles/update-routes', {
            method: 'PUT',
            body: JSON.stringify({
              roleId: found.roleId,
              allowedRoutes: routes
            })
          });
        }
      } catch (e) {
        console.error('Failed to update roles on C# backend, falling back to local Express:', e);
        await apiFetch(`/role-routes/${role}`, { method: 'PUT', body: JSON.stringify({ routes }) });
      }
    } else {
      await db.roleRoutes.put({ role: role as UserRole, routes });
    }
  },
  async getRolePermissions(role: string): Promise<RoleRoutePermission | undefined> {
    if (USE_SERVICES) {
      const list = await this.getRoleRoutes();
      return list.find(r => r.role === role);
    } else {
      return db.roleRoutes.where('role').equals(role).first();
    }
  },

  // Reports
  async getAttendance(): Promise<AttendanceRecord[]> {
    if (USE_SERVICES) {
      return apiFetch<AttendanceRecord[]>('/attendance');
    } else {
      return db.attendance.toArray();
    }
  },
  async getLeaves(): Promise<LeaveRecord[]> {
    if (USE_SERVICES) {
      return apiFetch<LeaveRecord[]>('/leaves');
    } else {
      return db.leaves.toArray();
    }
  },

  // C# Backend Reports
  async getAttendanceReport(branchId: string, startDate: string, endDate: string): Promise<any> {
    if (USE_SERVICES) {
      return apiFetch(`/Reports/attendance?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
    }
    return null;
  },
  async getDoubleShiftAuditReport(branchId: string, startDate: string, endDate: string): Promise<any> {
    if (USE_SERVICES) {
      return apiFetch(`/Reports/double-shift-audit?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
    }
    return null;
  },
  async getLeaveSummaryReport(branchId: string, year: number): Promise<any> {
    if (USE_SERVICES) {
      return apiFetch(`/Reports/leave-summary?branchId=${branchId}&year=${year}`);
    }
    return null;
  },
  async getHolidayPayReport(branchId: string, startDate: string, endDate: string): Promise<any> {
    if (USE_SERVICES) {
      return apiFetch(`/Reports/holiday-pay?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`);
    }
    return null;
  },

  // Manager Pin Verification
  async verifyManagerPin(branchId: string, pin: string): Promise<boolean> {
    if (USE_SERVICES) {
      try {
        const guidBranchId = branchId === 'branch-1' ? 'a1111111-a111-a111-a111-a11111111111' : branchId;
        const res = await apiFetch<any>('/Auth/verify-manager-pin', {
          method: 'POST',
          body: JSON.stringify({ branchId: guidBranchId, pin })
        });
        return res.isValid === true || res.success === true;
      } catch (e) {
        console.error('Failed to verify pin via C# backend, falling back to local check:', e);
        return pin === '1234' || pin === '9999';
      }
    } else {
      return pin === '1234' || pin === '9999';
    }
  },

  // Branches and POS Terminals
  async getBranches(): Promise<any[]> {
    if (USE_SERVICES) {
      return apiFetch<any[]>('/Branches');
    } else {
      return [
        { id: 'a1111111-a111-a111-a111-a11111111111', code: 'BR001', name: 'Head Office Branch' },
        { id: 'a2222222-a222-a222-a222-a22222222222', code: '35', name: 'Siam Paragon Branch' }
      ];
    }
  },

  async getTerminals(branchId: string): Promise<any[]> {
    if (USE_SERVICES) {
      return apiFetch<any[]>(`/Branches/${branchId}/terminals`);
    } else {
      if (branchId === 'a1111111-a111-a111-a111-a11111111111') {
        return [
          { id: 'c1111111-c111-c111-c111-c11111111111', terminalId: 'N01', name: 'Head Office Terminal 1' },
          { id: 'c1111111-c111-c111-c111-c11111111112', terminalId: 'N02', name: 'Head Office Terminal 2' }
        ];
      } else {
        return [
          { id: 'c2222222-c222-c222-c222-c22222222221', terminalId: 'N02', name: 'Siam Paragon Terminal 1' },
          { id: 'c2222222-c222-c222-c222-c22222222222', terminalId: 'N03', name: 'Siam Paragon Terminal 2' }
        ];
      }
    }
  },

  // Backend Authentication
  async login(username: string, passwordHash: string): Promise<UserAccount> {
    const res = await apiFetch<any>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password: passwordHash })
    });
    return {
      id: res.user.id,
      username: username,
      fullName: res.user.fullName,
      role: res.user.role as any,
      pin: '',
      email: '',
      passwordHash: '',
      lastLoginAt: new Date().toISOString()
    };
  },

  async getPromotions(): Promise<MemberPromotion[]> {
    if (USE_SERVICES) {
      return apiFetch<MemberPromotion[]>('/promotions');
    } else {
      return db.promotions.toArray();
    }
  },

  async loginPin(pin: string): Promise<UserAccount> {
    const res = await apiFetch<any>('/Auth/login-pin', {
      method: 'POST',
      body: JSON.stringify({ pin })
    });
    return {
      id: res.user.id,
      username: '',
      fullName: res.user.fullName,
      role: res.user.role as any,
      pin: pin,
      email: '',
      passwordHash: '',
      lastLoginAt: new Date().toISOString()
    };
  }
};
