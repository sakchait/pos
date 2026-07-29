import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  ArrowLeftRight,
  ShieldAlert,
  Plus,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { ShiftSchedule, ShiftSwapRequest, ShiftType } from '../../types/pos';

interface ShiftScheduleViewProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}

export const ShiftScheduleView: React.FC<ShiftScheduleViewProps> = ({
  currentUserId,
  currentUserName,
  currentUserRole,
}) => {
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-25');

  // New Shift Assign Form State
  const [employeeNameInput, setEmployeeNameInput] = useState<string>('Sarah Jenkins');
  const [employeeRoleInput, setEmployeeRoleInput] = useState<'BranchManager' | 'Cashier'>('Cashier');
  const [shiftTypeInput, setShiftTypeInput] = useState<ShiftType>('Morning');
  const [isHolidayInput, setIsHolidayInput] = useState<boolean>(false);

  // Validation Warning
  const [validationError, setValidationError] = useState<string>('');

  // Swap Request Form Modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [selectedScheduleToSwap, setSelectedScheduleToSwap] = useState<ShiftSchedule | null>(null);
  const [recipientNameInput, setRecipientNameInput] = useState<string>('Michael Chang');

  useEffect(() => {
    loadSchedulesAndSwaps();
  }, [selectedDate]);

  const loadSchedulesAndSwaps = async () => {
    const list = await apiService.getSchedules();
    setSchedules(list);

    const swapList = await apiService.getSwaps();
    setSwaps(swapList);
  };

  const shiftTimes: Record<ShiftType, string> = {
    Morning: '06:00 - 14:00 (8 hrs)',
    Afternoon: '14:00 - 22:00 (8 hrs)',
    Night: '22:00 - 06:00 (8 hrs)',
  };

  // Check 3 consecutive shifts rule (HARD BLOCK)
  const checkConsecutiveShiftsViolation = (employeeName: string, targetDate: string, newShiftType: ShiftType): boolean => {
    const empSchedules = schedules.filter(
      (s) => s.employeeName.toLowerCase().includes(employeeName.toLowerCase().split(' ')[0].toLowerCase()) && s.date === targetDate
    );

    const assignedTypes = empSchedules.map((s) => s.shiftType);

    // If trying to assign 3rd shift on the same day -> 24 HOURS HARD BLOCK
    if (assignedTypes.length >= 2) {
      return true; // VIOLATION!
    }

    return false;
  };

  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Check Double Shift / Consecutive Shift hard block rule
    const isViolation = checkConsecutiveShiftsViolation(employeeNameInput, selectedDate, shiftTypeInput);

    if (isViolation) {
      setValidationError(
        `HARD BLOCK: ${employeeNameInput} is already scheduled for 2 consecutive shifts on ${selectedDate} (16 hrs). Labor law strictly prohibits 3 consecutive shifts (24 hrs).`
      );
      return;
    }

    const newSchedule: ShiftSchedule = {
      id: `sch-${Date.now()}`,
      employeeId: `emp-${Date.now()}`,
      employeeName: `${employeeNameInput} (${employeeRoleInput})`,
      role: employeeRoleInput,
      date: selectedDate,
      shiftType: shiftTypeInput,
      status: 'SCHEDULED',
      isHoliday: isHolidayInput,
    };

    await apiService.addSchedule(newSchedule);
    await loadSchedulesAndSwaps();
    setValidationError('');
  };

  const handleOpenSwapModal = (sch: ShiftSchedule) => {
    setSelectedScheduleToSwap(sch);
    setIsSwapModalOpen(true);
  };

  const handleSubmitSwapRequest = async () => {
    if (!selectedScheduleToSwap) return;

    const newSwap: ShiftSwapRequest = {
      id: `swap-${Date.now()}`,
      requesterId: selectedScheduleToSwap.employeeId,
      requesterName: selectedScheduleToSwap.employeeName,
      recipientId: `emp-recipient`,
      recipientName: recipientNameInput,
      scheduleId: selectedScheduleToSwap.id,
      date: selectedScheduleToSwap.date,
      shiftType: selectedScheduleToSwap.shiftType,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    await apiService.addSwap(newSwap);
    await apiService.updateSchedule(selectedScheduleToSwap.id, { status: 'SWAP_PENDING' });

    await loadSchedulesAndSwaps();
    setIsSwapModalOpen(false);
    setSelectedScheduleToSwap(null);
  };

  const handleManagerApproveSwap = async (swapId: string, scheduleId: string, approve: boolean) => {
    await apiService.updateSwap(swapId, {
      status: approve ? 'APPROVED' : 'REJECTED',
    });

    if (approve) {
      const swap = swaps.find((s) => s.id === swapId);
      if (swap) {
        await apiService.updateSchedule(scheduleId, {
          employeeName: `${swap.recipientName} (Cashier)`,
          status: 'SCHEDULED',
        });
      }
    } else {
      await apiService.updateSchedule(scheduleId, { status: 'SCHEDULED' });
    }

    await loadSchedulesAndSwaps();
  };

  // Group schedules by shift type for selected date
  const selectedDateSchedules = schedules.filter((s) => s.date === selectedDate);
  const morningShifts = selectedDateSchedules.filter((s) => s.shiftType === 'Morning');
  const afternoonShifts = selectedDateSchedules.filter((s) => s.shiftType === 'Afternoon');
  const nightShifts = selectedDateSchedules.filter((s) => s.shiftType === 'Night');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
                Shift Scheduling & Staff Swaps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                3 Shifts per day • Staffing minimums enforcement • 24hr Double Shift Hard Block
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-bold text-xs outline-none"
          />
        </div>
      </div>

      {/* Validation Warning Banner */}
      {validationError && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 p-4 rounded-2xl flex items-center gap-3 text-rose-900 dark:text-rose-200 text-xs font-semibold animate-in fade-in">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Labor Rule Violation Blocked</p>
            <p className="mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      {/* Assign Shift Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Plus className="w-5 h-5 text-orange-600" /> Assign Employee Shift
        </h3>

        <form onSubmit={handleAssignShift} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Employee Name</label>
            <input
              type="text"
              required
              value={employeeNameInput}
              onChange={(e) => setEmployeeNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
            <select
              value={employeeRoleInput}
              onChange={(e: any) => setEmployeeRoleInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              <option value="Cashier">Cashier</option>
              <option value="BranchManager">Branch Manager</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Shift Type</label>
            <select
              value={shiftTypeInput}
              onChange={(e: any) => setShiftTypeInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              <option value="Morning">Morning (06:00 - 14:00)</option>
              <option value="Afternoon">Afternoon (14:00 - 22:00)</option>
              <option value="Night">Night (22:00 - 06:00)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="holiday"
              checked={isHolidayInput}
              onChange={(e) => setIsHolidayInput(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="holiday" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Public Holiday (2.0x Pay)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Assign Shift
            </button>
          </div>
        </form>
      </div>

      {/* 3 Shifts per Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Morning', 'Afternoon', 'Night'] as ShiftType[]).map((st) => {
          const shiftList =
            st === 'Morning' ? morningShifts : st === 'Afternoon' ? afternoonShifts : nightShifts;

          const managerCount = shiftList.filter((s) => s.role === 'BranchManager').length;
          const cashierCount = shiftList.filter((s) => s.role === 'Cashier').length;
          const meetsMin = managerCount >= 1 && cashierCount >= 1;

          return (
            <div
              key={st}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{st} Shift</h3>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" /> {shiftTimes[st]}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    meetsMin
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {meetsMin ? 'Min Staffed' : 'Low Staffing'}
                </span>
              </div>

              {/* Staffing indicators */}
              <div className="flex gap-3 text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span>Managers: {managerCount}/1 min</span>
                <span>•</span>
                <span>Cashiers: {cashierCount}/1-2 min</span>
              </div>

              {/* Shift list */}
              <div className="space-y-2">
                {shiftList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No staff scheduled for {st}.</p>
                ) : (
                  shiftList.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{sch.employeeName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {sch.isHoliday && (
                            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                              HOLIDAY 2.0x
                            </span>
                          )}
                          {sch.status === 'SWAP_PENDING' && (
                            <span className="text-[9px] font-extrabold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                              SWAP PENDING
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSwapModal(sch)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        title="Request Shift Swap"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manager Swap Approval Workflow Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-purple-600" /> Shift Swap Requests (Manager Approval)
        </h3>

        {swaps.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No shift swap requests pending.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-1.5 px-3">Requester</th>
                  <th className="py-1.5 px-3">Target Recipient</th>
                  <th className="py-1.5 px-3">Date & Shift</th>
                  <th className="py-1.5 px-3">Status</th>
                  <th className="py-1.5 px-3 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {swaps.map((sw) => (
                  <tr key={sw.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-slate-100">{sw.requesterName}</td>
                    <td className="py-1.5 px-3 font-bold text-purple-600">{sw.recipientName}</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-300">
                      {sw.date} ({sw.shiftType})
                    </td>
                    <td className="py-1.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          sw.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sw.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {sw.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      {sw.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleManagerApproveSwap(sw.id, sw.scheduleId, true)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleManagerApproveSwap(sw.id, sw.scheduleId, false)}
                            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 hover:bg-rose-700"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Swap Request Modal */}
      {isSwapModalOpen && selectedScheduleToSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Submit Shift Swap Request</h3>
            <p className="text-xs text-slate-500">
              Requesting swap for {selectedScheduleToSwap.employeeName} on {selectedScheduleToSwap.date} (
              {selectedScheduleToSwap.shiftType}).
            </p>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Swap Recipient</label>
              <input
                type="text"
                value={recipientNameInput}
                onChange={(e) => setRecipientNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="flex-1 py-3 border rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSwapRequest}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
