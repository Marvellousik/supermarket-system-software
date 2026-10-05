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
        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
          Shift Audit Logs ({shifts.length} Records)
        </h3>
        <span className="text-[11px] text-[#71717a]">
          Terminal shift tracking
        </span>
      </div>

      <div className="bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow overflow-hidden">
        <div className="grid grid-cols-4 p-3 bg-[#fbfbf5] text-[10px] uppercase tracking-wider text-[#71717a] font-semibold border-b border-[#e4e4e7]">
          <div>Terminal</div>
          <div>Cashier</div>
          <div>Shift Start</div>
          <div>Shift End</div>
        </div>

        {shifts.length === 0 ? (
          <div className="text-center py-10 text-[#a1a1aa] bg-white">
            No shifts logged yet.
          </div>
        ) : (
          <div className="divide-y divide-[#e4e4e7] bg-white">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="grid grid-cols-4 items-center text-xs p-3 hover:bg-[#fbfbf5] transition-colors"
              >
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c1fbd4] text-black border border-[#a8f5c2]">
                    {getMachineLabel(shift.machineId)}
                  </span>
                </div>
                <div className="font-semibold text-black uppercase">{getCashierName(shift.cashierId)}</div>
                <div className="text-[11px] text-[#71717a]">
                  {formatDateTime(shift.startTime)}
                </div>
                <div>
                  {shift.endTime ? (
                    <span className="text-[11px] text-[#71717a]">
                      {formatDateTime(shift.endTime)}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c1fbd4] border border-[#a8f5c2] text-[10px] text-black font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
