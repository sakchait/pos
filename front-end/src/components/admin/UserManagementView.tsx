import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  Lock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  Briefcase,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { UserAccount } from '../../types/pos';

interface UserManagementViewProps {
  userRole: string;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ userRole }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [role, setRole] = useState<string>('Cashier');
  const [hourlyRate, setHourlyRate] = useState<number>(50.00);
  const [branchId, setBranchId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAuthorized = userRole === 'Admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const list = await apiService.getUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
      setError('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentUserId('');
    setUsername('');
    setFullName('');
    setPassword('');
    setPin('');
    setRole('Cashier');
    setHourlyRate(50.00);
    setBranchId('');
    setVendorId('');
    setIsAdmin(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: UserAccount) => {
    setIsEditing(true);
    setCurrentUserId(u.id);
    setUsername(u.username);
    setFullName(u.fullName);
    setPassword(''); // leave blank unless changing
    setPin(u.pin || '');
    setRole(u.role);
    setHourlyRate(u.hourlyRate || 50.00);
    setBranchId(u.branchId || '');
    setVendorId(u.vendorId || '');
    setIsAdmin(u.isAdmin || false);
    setIsActive(u.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setIsLoading(true);

      const payload: Omit<UserAccount, 'id'> = {
        username: username.trim(),
        fullName: fullName.trim(),
        email: `${username.trim()}@omnipos.com`,
        role,
        passwordHash: password ? password : '',
        pin: pin.trim(),
        hourlyRate,
        branchId: branchId || undefined,
        vendorId: vendorId || undefined,
        isAdmin,
        isActive
      };

      if (isEditing) {
        await apiService.updateUser(currentUserId, payload);
        setSuccess('อัปเดตผู้ใช้งานเรียบร้อยแล้ว');
      } else {
        if (!password) {
          setError('กรุณากรอกรหัสผ่านสำหรับผู้ใช้งานใหม่');
          setIsLoading(false);
          return;
        }
        await apiService.createUser(payload);
        setSuccess('เพิ่มผู้ใช้งานสำเร็จ');
      }

      setIsModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบผู้ใช้งานรายนี้ใช่หรือไม่?')) return;

    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      await apiService.deleteUser(id);
      setSuccess('ลบผู้ใช้งานเรียบร้อยแล้ว');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const adminCount = users.filter((u) => u.role === 'Admin' || u.isAdmin === true).length;
  const avgHourlyRate = users.length
    ? (users.reduce((acc, u) => acc + (u.hourlyRate || 0), 0) / users.length).toFixed(2)
    : '0.00';

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const displayedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            User & Employee Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Manage system access, roles, branches, wage configurations, and status.
          </p>
        </div>

        {isAuthorized && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            เพิ่มผู้ใช้งานใหม่
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-250 dark:border-rose-900 p-3.5 rounded-2xl text-xs text-rose-800 dark:text-rose-400 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900 p-3.5 rounded-2xl text-xs text-emerald-800 dark:text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Staff</div>
            <div className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{activeCount} / {users.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Administrators</div>
            <div className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{adminCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Hourly Rate</div>
            <div className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{avgHourlyRate} THB</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
          <input
            type="text"
            placeholder="Search by name, username, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-455 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                <th className="p-4 pl-6">Staff Member</th>
                <th className="p-4">Username</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Assigned Unit / Branch</th>
                <th className="p-4">Hourly Rate</th>
                <th className="p-4">Status</th>
                {isAuthorized && <th className="p-4 pr-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Fetching employee database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-450 font-medium">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((u) => {
                  const isActiveUser = u.isActive !== false;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                    >
                      {/* Staff Member */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'}
                            alt=""
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                              {u.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.department || 'General Staff'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="p-4 text-slate-650 dark:text-slate-350 font-mono text-[11px]">
                        {u.username}
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (u.roleName || u.role) === 'Admin'
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : (u.roleName || u.role) === 'BranchManager'
                              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {u.roleName || u.role}
                        </span>
                      </td>

                      {/* Unit / Branch */}
                      <td className="p-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1 text-[11px]">
                          {u.branchId ? (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{u.selectedBranchName || 'Branch Node'}</span>
                            </>
                          ) : u.vendorId ? (
                            <>
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>Supplier Unit</span>
                            </>
                          ) : (
                            <span className="text-slate-400">Headquarters</span>
                          )}
                        </div>
                      </td>

                      {/* Hourly Rate */}
                      <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-350">
                        {u.hourlyRate || 50.00} THB/hr
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isActiveUser ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-[10px]">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      {isAuthorized && (
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-1.5 border border-slate-250 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
                {isEditing ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5">
                {isEditing ? 'อัปเดตรายละเอียดและสิทธิ์การเข้าใช้งานระบบ' : 'ตั้งค่าบัญชีการเข้าทำงานสําหรับบุคลากรใหม่'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                  disabled={isEditing}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  {isEditing ? 'รหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)' : 'รหัสผ่าน *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  required={!isEditing}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">PIN Code (4 หลัก)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">ตำแหน่ง / สิทธิ์ (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="BranchManager">BranchManager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="StockClerk">StockClerk</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">อัตราค่าจ้าง (บาท/ชั่วโมง)</label>
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">สาขาประจำ (Branch)</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="">สำนักงานใหญ่ (Headquarters)</option>
                  <option value="b1111111-b111-b111-b111-b11111111111">สาขาหลัก (Main Branch)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">หน่วยผลิต / ซัพพลายเออร์ (Vendor)</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="">ไม่มี (Internal Unit)</option>
                  <option value="v1111111-v111-v111-v111-v11111111111">ซัพพลายเออร์เมล็ดกาแฟ</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                แต่งตั้งเป็นผู้ดูแลระบบ (Admin Role)
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                เปิดใช้งานบัญชี (Active Account)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl font-bold text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl font-bold text-xs"
              >
                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
