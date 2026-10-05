"use client";

import React from "react";
import type { Employee, Machine } from "@/types/Entities";
import { useAuth } from "@/context/AuthContext";

interface ShiftManagementProps {
  machines: Machine[];
  employees: Employee[];
}

export default function ShiftManagement({
  machines,
  employees,
}: ShiftManagementProps) {
  const { shifts } = useAuth();

  const getCashierName = (cashierId: number) => {
    const cashier = employees.find((emp) => emp.id === cashierId);
    return cashier?.username || `Staff #${cashierId}`;
  };

  const getMachineLabel = (machineId: number) => {
    const machine = machines.find((m) => m.id === machineId);
    return machine ? `Machine 0${machine.id}` : `Machine 0${machineId}`;
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "In Progress";
    return new Date(dateTimeStr).toLocaleString();
  };

  return (
    <div className="mb-6 font-mono text-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Shift Audit Logs ({shifts.length} Records)
        </h3>
        <span className="text-[11px] text-slate-500">
          Terminal shift tracking
        </span>
      </div>

      <div className="grid grid-cols-4 p-2.5 bg-slate-100 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200 rounded-t-lg">
        <div>Terminal</div>
        <div>Cashier</div>
        <div>Shift Start</div>
        <div>Shift End</div>
      </div>

      {shifts.length === 0 ? (
        <div className="text-center py-8 text-slate-400 bg-white border border-slate-200 rounded-b-lg">
          No shifts logged yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-200 border-x border-b border-slate-200 rounded-b-lg overflow-hidden bg-white shadow-sm">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="grid grid-cols-4 items-center text-xs p-2.5 bg-white hover:bg-slate-50 transition-colors"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {getMachineLabel(shift.machineId)}
                </span>
              </div>
              <div className="font-semibold text-slate-800 uppercase">{getCashierName(shift.cashierId)}</div>
              <div className="text-[11px] text-slate-500">
                {formatDateTime(shift.startTime)}
              </div>
              <div>
                {shift.endTime ? (
                  <span className="text-[11px] text-slate-500">
                    {formatDateTime(shift.endTime)}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
