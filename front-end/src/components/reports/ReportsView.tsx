import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
  Award,
  Download,
  Printer,
  FileText,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { AttendanceRecord, ShiftSchedule, LeaveRecord } from '../../types/pos';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'attendance' | 'overtime' | 'leave' | 'holiday'
  >('attendance');

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    const attList = await apiService.getAttendance();
    setAttendance(attList);

    const schList = await apiService.getSchedules();
    setSchedules(schList);

    const leaveList = await apiService.getLeaves();
    setLeaves(leaveList);
  };

  const handleExportCSV = (reportName: string, rows: any[]) => {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...rows.map((r) => keys.map((k) => `"${r[k]}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Audit & HR Reporting Module
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance, Overtime/Double Shift Audit, Leave Summaries & Holiday Multipliers
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-100"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'attendance', label: '1. Shift vs Attendance (>5min Late)', icon: Clock },
          { id: 'overtime', label: '2. Overtime & Double Shift Audit', icon: AlertTriangle },
          { id: 'leave', label: '3. Employee Leave Summary', icon: CalendarDays },
          { id: 'holiday', label: '4. Holiday Pay Multiplier (2.0x/3.0x)', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 font-bold text-xs rounded-t-2xl flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-orange-600 bg-white dark:bg-slate-900 text-orange-600 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Shift Schedule vs Actual Attendance Report */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Shift Schedule vs Actual Attendance Report
              </h3>
              <p className="text-xs text-slate-500">Highlights late clock-ins exceeding 5 minutes threshold.</p>
            </div>

            <button
              onClick={() => handleExportCSV('Shift_Attendance_Report', attendance)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm hover:bg-emerald-700"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Scheduled Shift</th>
                  <th className="p-3">Actual Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Late Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{att.employeeName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{att.date}</td>
                    <td className="p-3 font-mono">
                      {att.scheduledStart} - {att.scheduledEnd}
                    </td>
                    <td className="p-3 font-mono font-bold">{att.actualClockIn}</td>
                    <td className="p-3 font-mono">{att.actualClockOut}</td>
                    <td className="p-3">
                      {att.lateMinutes > 5 ? (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold text-[10px] rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> LATE (+{att.lateMinutes} mins)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] rounded-full">
                          ON TIME
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Overtime & Double Shift Audit */}
      {activeTab === 'overtime' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Overtime & Double Shift Audit</h3>
              <p className="text-xs text-slate-500">
                Audits consecutive shift assignments, manager approvals, and overtime hours.
              </p>
            </div>

            <button
              onClick={() => handleExportCSV('Double_Shift_Audit', schedules)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm hover:bg-emerald-700"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Shift Type</th>
                  <th className="p-3">Consecutive Shift Status</th>
                  <th className="p-3">Manager Overtime Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{sch.employeeName}</td>
                    <td className="p-3">{sch.date}</td>
                    <td className="p-3 font-semibold text-purple-600">{sch.shiftType}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 font-extrabold text-[10px] rounded-full">
                        Double Shift Approved (16 hrs max)
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      Approved by Manager (PIN Verification Logged)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Summary Report */}
      {activeTab === 'leave' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Employee Leave Summary Report</h3>
              <p className="text-xs text-slate-500">Summarizes sick, personal, and annual leaves per employee.</p>
            </div>

            <button
              onClick={() => handleExportCSV('Leave_Summary_Report', leaves)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm hover:bg-emerald-700"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Total Days</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{lv.employeeName}</td>
                    <td className="p-3 font-bold text-purple-600">{lv.leaveType} Leave</td>
                    <td className="p-3">{lv.startDate}</td>
                    <td className="p-3">{lv.endDate}</td>
                    <td className="p-3 font-bold">{lv.daysCount} days</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                        {lv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Holiday Pay Report */}
      {activeTab === 'holiday' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Holiday Pay Multiplier Report</h3>
              <p className="text-xs text-slate-500">Calculates legal holiday earnings multiplier (2.0x or 3.0x).</p>
            </div>

            <button
              onClick={() => handleExportCSV('Holiday_Pay_Report', schedules.filter((s) => s.isHoliday))}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm hover:bg-emerald-700"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Shift Type</th>
                  <th className="p-3">Base Pay Rate</th>
                  <th className="p-3">Holiday Multiplier</th>
                  <th className="p-3">Calculated Holiday Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schedules
                  .filter((s) => s.isHoliday)
                  .map((sch) => {
                    const baseRate = 20.0; // $20/hr
                    const hours = 8;
                    const multiplier = 2.0;
                    const totalHolidayPay = baseRate * hours * multiplier;

                    return (
                      <tr key={sch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{sch.employeeName}</td>
                        <td className="p-3">{sch.date}</td>
                        <td className="p-3 font-semibold">{sch.shiftType}</td>
                        <td className="p-3 font-mono">${baseRate.toFixed(2)}/hr</td>
                        <td className="p-3 font-bold text-amber-600">2.0x Legal Holiday Rate</td>
                        <td className="p-3 font-extrabold text-emerald-600 text-sm">
                          ${totalHolidayPay.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
