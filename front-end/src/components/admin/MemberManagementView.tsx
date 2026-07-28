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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-orange-500" />
            <span>Loyalty Member Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register new customers, view loyalty points, configure membership tiers, and inspect purchase statistics.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              handleClearForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Loyalty Member</span>
          </button>
        )}
      </div>

      {/* Success/Error Banners */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-sm text-emerald-400 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-sm text-rose-400 font-semibold flex items-center gap-2 animate-in fade-in">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Widgets Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Members</p>
            <p className="text-3xl font-black text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Platinum Tiers</p>
            <p className="text-3xl font-black text-cyan-400 mt-1">{platinumCount}</p>
          </div>
          <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gold Tiers</p>
            <p className="text-3xl font-black text-yellow-500 mt-1">{goldCount}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Customer Spend</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">${avgSpent.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Members Grid/Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone number, or member number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing {filteredMembers.length} of {totalCount} registered accounts
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Loading Member Registry...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
              <Users className="w-12 h-12 text-slate-700" />
              <p className="text-sm font-semibold">No loyalty members found.</p>
              <p className="text-xs text-slate-600">Try matching different search terms or register a new customer.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-850">
                  <th className="py-4 px-6">Member ID / Tier</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6 text-center">Loyalty Points</th>
                  <th className="py-4 px-6 text-right">Total Spent</th>
                  <th className="py-4 px-6">Date Joined</th>
                  {isManager && <th className="py-4 px-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {filteredMembers.map((m) => {
                  let tierColor = 'bg-slate-800 text-slate-400';
                  if (m.tier.toLowerCase() === 'gold') tierColor = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
                  else if (m.tier.toLowerCase() === 'platinum') tierColor = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
                  else if (m.tier.toLowerCase() === 'silver') tierColor = 'bg-slate-300/10 text-slate-300 border border-slate-300/20';
                  else if (m.tier.toLowerCase() === 'bronze') tierColor = 'bg-amber-800/10 text-amber-500 border border-amber-800/20';

                  return (
                    <tr key={m.id} className="hover:bg-slate-950/20 transition-all">
                      <td className="py-4.5 px-6">
                        <p className="font-mono font-bold text-white">{m.memberNo}</p>
                        <span className={`inline-block text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full mt-1.5 ${tierColor}`}>
                          {m.tier}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 font-bold text-slate-100">{m.name}</td>
                      <td className="py-4.5 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{m.phone}</span>
                        </div>
                        {m.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{m.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4.5 px-6 text-center font-mono font-black text-amber-400">
                        {m.points.toLocaleString()} pts
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono font-bold text-emerald-400">
                        ${(m.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4.5 px-6 text-slate-400">{m.joinDate}</td>
                      {isManager && (
                        <td className="py-4.5 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(m)}
                              className="p-2 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded-xl hover:text-white transition-all cursor-pointer"
                              title="Edit Member Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(m)}
                              className="p-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 rounded-xl hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Register/Edit Member Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {isEditing ? 'Update Loyalty Member' : 'Register New Loyalty Member'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isEditing ? 'Modify account details, points balances, or tier settings.' : 'Fill in client contact information to initiate membership.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0812345678"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-slate-650 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Points Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Total Spent ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalSpent}
                    onChange={(e) => setTotalSpent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Loyalty Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
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
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
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
