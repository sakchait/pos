import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  Package,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Coupon, Product } from '../../types/pos';

interface CouponManagementViewProps {
  userRole: string;
}

export const CouponManagementView: React.FC<CouponManagementViewProps> = ({ userRole }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentCouponCode, setCurrentCouponCode] = useState<string>('');

  // Form states
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isManager = userRole === 'BranchManager' || userRole === 'Admin';

  useEffect(() => {
    loadData();
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [allCoupons, allProducts] = await Promise.all([
        apiService.getCoupons(),
        apiService.getProducts(),
      ]);
      setCoupons(allCoupons);
      setProducts(allProducts);
    } catch (e: any) {
      setError('Failed to load coupons or products: ' + (e.message || e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setCurrentCouponCode('');
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount(0);
    setMaxDiscountAmount(0);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
    setUsageLimit(100);
    setIsActive(true);
    setSelectedProductIds([]);
    setError('');
  };

  const handleEditClick = (coupon: Coupon) => {
    setIsEditing(true);
    setCurrentCouponCode(coupon.code);
    setCode(coupon.code);
    setDescription(coupon.description);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinOrderAmount(coupon.minOrderAmount);
    setMaxDiscountAmount(coupon.maxDiscountAmount);
    setStartDate(coupon.startDate);
    setEndDate(coupon.endDate);
    setUsageLimit(coupon.usageLimit);
    setIsActive(coupon.isActive);
    setSelectedProductIds(coupon.applicableProductIds || []);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) {
      setError('Permission Denied: Only Branch Managers and Admins can modify coupons.');
      return;
    }

    if (!code.trim()) {
      setError('Coupon code is required.');
      return;
    }

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '');

    if (discountValue <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      setError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    const couponData: Coupon = {
      id: formattedCode,
      code: formattedCode,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      usedCount: isEditing ? coupons.find(c => c.code === currentCouponCode)?.usedCount || 0 : 0,
      isActive,
      applicableProductIds: selectedProductIds,
    };

    try {
      setError('');
      setSuccess('');
      if (isEditing) {
        // Update in backend and locally
        await apiService.updateCoupon(currentCouponCode, couponData);
        setSuccess(`Coupon ${formattedCode} updated successfully.`);
      } else {
        // Check duplication
        const duplicate = coupons.some(c => c.code === formattedCode);
        if (duplicate) {
          setError(`Coupon code ${formattedCode} already exists.`);
          return;
        }
        await apiService.createCoupon(couponData);
        setSuccess(`Coupon ${formattedCode} created successfully.`);
      }
      handleClearForm();
      await loadData();
    } catch (err: any) {
      setError('Operation failed: ' + (err.message || err));
    }
  };

  const handleDeleteClick = async (couponCode: string) => {
    if (!isManager) {
      setError('Permission Denied: Only Branch Managers and Admins can delete coupons.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete (reject) coupon ${couponCode}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await apiService.deleteCoupon(couponCode);
      setSuccess(`Coupon ${couponCode} deleted successfully.`);
      await loadData();
      if (currentCouponCode === couponCode) {
        handleClearForm();
      }
    } catch (err: any) {
      setError('Failed to delete coupon: ' + (err.message || err));
    }
  };

  const handleToggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredCoupons.length / pageSize);
  const displayedCoupons = filteredCoupons.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-2xl">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Coupon Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, update, and reject discount codes • Restricted to Managers and Admins
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
          Role: <span className="text-orange-500 font-bold">{userRole}</span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Area: List of coupons (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Active Coupons
              </h3>
              <input
                type="text"
                placeholder="Search by code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading coupons...</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Tag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No coupons found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase font-bold tracking-wider">
                      <th className="py-2 px-4">Code</th>
                      <th className="py-2 px-4">Description</th>
                      <th className="py-2 px-4">Discount</th>
                      <th className="py-2 px-4">Validity</th>
                      <th className="py-2 px-4 text-center">Used/Limit</th>
                      <th className="py-2 px-4 text-center">Status</th>
                      <th className="py-2 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayedCoupons.map((coupon) => {
                      const isExpired = new Date(coupon.endDate) < new Date();
                      return (
                        <tr
                          key={coupon.code}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {coupon.code}
                          </td>
                          <td className="py-2 px-4 text-slate-600 dark:text-slate-300">
                            {coupon.description || '-'}
                          </td>
                          <td className="py-2 px-4 font-bold text-orange-600">
                            {coupon.discountValue}
                            {coupon.discountType === 'percentage' ? '%' : ' บาท'}
                          </td>
                          <td className="py-2 px-4 text-slate-500 text-[11px]">
                            {coupon.startDate} to {coupon.endDate}
                          </td>
                          <td className="py-2 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                            {coupon.usedCount} / {coupon.usageLimit || '∞'}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                coupon.isActive && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {coupon.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(coupon)}
                                disabled={!isManager}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-955/40 rounded-lg transition-colors disabled:opacity-40"
                                title="Edit Coupon"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(coupon.code)}
                                disabled={!isManager}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-40"
                                title="Delete (Reject) Coupon"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
                  className="px-2 py-1 border border-slate-200 dark:border-slate-850 bg-transparent rounded-lg text-xs outline-none cursor-pointer"
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
                  className="px-3 py-1 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Form for Creating/Editing (1/3 width) */}
        <div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="WELCOME20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isEditing || !isManager}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 disabled:opacity-50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Enter coupon promotion details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isManager}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash (฿)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* Minimum & Maximum Amounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Min Order (฿)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Max Discount (฿)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(parseFloat(e.target.value) || 0)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
                    placeholder="0 = No limit"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* Limit & Status */}
              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(parseInt(e.target.value) || 0)}
                    disabled={!isManager}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 self-start">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    disabled={!isManager}
                    className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-orange-500 disabled:opacity-40"
                  >
                    {isActive ? (
                      <ToggleRight className="w-8 h-8 text-emerald-600 cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400 cursor-pointer" />
                    )}
                    <span className="text-xs font-bold">{isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
              </div>

              {/* Product Exclusion / Restriction */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Limit to Products (Optional)
                </label>
                <div className="max-h-28 overflow-y-auto border border-slate-200 dark:border-slate-850 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                  {products.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProduct(p.id)}
                          disabled={!isManager}
                          className="rounded-sm border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span>
                          {p.name} ({p.category})
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" /> If none selected, applies to all items in cart.
                </p>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={!isManager}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/35 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Create Coupon'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
