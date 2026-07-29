import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  Mail,
  Phone,
  Award,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  X,
  RefreshCw,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Member } from '../../types/pos';

interface MemberManagementViewProps {
  userRole: string;
}

export const MemberManagementView: React.FC<MemberManagementViewProps> = ({ userRole }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Editing state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentMemberId, setCurrentMemberId] = useState<string>('');

  // Form states
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [tier, setTier] = useState<string>('Standard');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal open state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isManager = userRole === 'BranchManager' || userRole === 'Admin';

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const list = await apiService.getMembers();
      setMembers(list);
    } catch (e: any) {
      setError('Failed to load members: ' + (e.message || e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setCurrentMemberId('');
    setName('');
    setPhone('');
    setEmail('');
    setPoints(0);
    setTotalSpent(0);
    setTier('Standard');
    setError('');
  };

  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    setCurrentMemberId(member.id);
    setName(member.name);
    setPhone(member.phone);
    setEmail(member.email || '');
    setPoints(member.points);
    setTotalSpent(member.totalSpent || 0);
    setTier(member.tier);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) {
      setError('Permission Denied: Only Branch Managers and Admins can modify members.');
      return;
    }

    if (!name.trim()) {
      setError('Member name is required.');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    try {
      setError('');
      if (isEditing) {
        await apiService.updateMember(currentMemberId, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          points: Number(points),
          totalSpent: Number(totalSpent),
          tier,
        });
        setSuccess('Member updated successfully!');
      } else {
        await apiService.createMember({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          points: Number(points),
          totalSpent: Number(totalSpent),
          tier,
        });
        setSuccess('New member registered successfully!');
      }
      handleClearForm();
      setIsModalOpen(false);
      await loadMembers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save member details. Make sure the phone number is unique.');
    }
  };

  const handleDeleteClick = async (member: Member) => {
    if (!isManager) {
      setError('Permission Denied: Only Branch Managers and Admins can delete members.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete member "${member.name}" (${member.memberNo})?`)) {
      return;
    }

    try {
      setError('');
      await apiService.deleteMember(member.id);
      setSuccess('Member deleted successfully!');
      await loadMembers();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete member.');
    }
  };

  // Filter members list based on query
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q))
    );
  });

  // Analytics helper variables
  const totalCount = members.length;
  const platinumCount = members.filter((m) => m.tier.toLowerCase() === 'platinum').length;
  const goldCount = members.filter((m) => m.tier.toLowerCase() === 'gold').length;
  const totalRevenue = members.reduce((acc, m) => acc + (m.totalSpent || 0), 0);
  const avgSpent = totalCount > 0 ? totalRevenue / totalCount : 0;

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const displayedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            <span>Loyalty Member Management</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Register new customers, view loyalty points, configure membership tiers, and inspect purchase statistics.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              handleClearForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loyalty Member</span>
          </button>
        )}
      </div>

      {/* Success/Error Banners */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900 p-3.5 rounded-2xl text-xs text-emerald-800 dark:text-emerald-400 font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 rounded-2xl text-xs text-rose-800 dark:text-rose-400 font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Widgets Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Members</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-550 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Platinum Tiers</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{platinumCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gold Tiers</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{goldCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Customer Spend</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">${avgSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Members Grid/Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone number, or member number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="text-xs text-slate-450">
            Showing {filteredMembers.length} of {totalCount} registered accounts
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading Member Registry...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No loyalty members found.</p>
              <p className="text-xs text-slate-400">Try matching different search terms or register a new customer.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800/80">
                  <th className="py-2 px-4 pl-6">Member ID / Tier</th>
                  <th className="py-2 px-4">Full Name</th>
                  <th className="py-2 px-4">Contact Info</th>
                  <th className="py-2 px-4 text-center">Loyalty Points</th>
                  <th className="py-2 px-4 text-right">Total Spent</th>
                  <th className="py-2 px-4">Date Joined</th>
                  {isManager && <th className="py-2 px-4 pr-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {displayedMembers.map((m) => {
                  let tierColor = 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-400';
                  if (m.tier.toLowerCase() === 'gold') tierColor = 'bg-yellow-100/70 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-500 border border-yellow-250 dark:border-yellow-900';
                  else if (m.tier.toLowerCase() === 'platinum') tierColor = 'bg-cyan-100/70 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900';
                  else if (m.tier.toLowerCase() === 'silver') tierColor = 'bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
                  else if (m.tier.toLowerCase() === 'bronze') tierColor = 'bg-orange-100/70 text-orange-700 dark:bg-orange-950/40 dark:text-orange-500 border border-orange-200 dark:border-orange-900';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="py-2 px-4 pl-6">
                        <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{m.memberNo}</p>
                        <span className={`inline-block text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full mt-1.5 ${tierColor}`}>
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-bold text-slate-700 dark:text-slate-300">{m.name}</td>
                      <td className="py-2 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{m.phone}</span>
                        </div>
                        {m.email && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{m.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4 text-center font-mono font-bold text-amber-500 dark:text-amber-400">
                        {m.points.toLocaleString()} pts
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-455">
                        ${(m.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-4 text-slate-450">{m.joinDate}</td>
                      {isManager && (
                        <td className="py-2 px-4 pr-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(m)}
                              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                              title="Edit Member Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(m)}
                              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-650 rounded-lg transition-colors"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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

      {/* Register/Edit Member Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
                  {isEditing ? 'Update Loyalty Member' : 'Register New Loyalty Member'}
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5">
                  {isEditing ? 'Modify account details, points balances, or tier settings.' : 'Fill in client contact information to initiate membership.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0812345678"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Points Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Total Spent ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalSpent}
                    onChange={(e) => setTotalSpent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Loyalty Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md"
                >
                  {isEditing ? 'Save Changes' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
