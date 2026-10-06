"use client";

import React, { useState } from "react";
import type { Employee, Machine, Cashier } from "@/types/Entities";
import ShiftManagement from "./ShiftManagement";
import { useAuth } from "@/context/AuthContext";
import { Monitor, Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface StaffManagementProps {
  onAddEmployee?: (employee: Employee) => void;
  onRemoveEmployee?: (employeeId: number) => void;
}

export default function StaffManagement({
  onAddEmployee,
  onRemoveEmployee,
}: StaffManagementProps) {
  const {
    cashiers,
    machines,
    addCashier,
    removeCashier,
    addMachine,
    removeMachine,
    currentUser,
    login,
  } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formType, setFormType] = useState<"machine" | "cashier">("cashier");
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({});
  const [showPasswordMap, setShowPasswordMap] = useState<Record<number, boolean>>({});

  const togglePasswordVisibility = (employeeId: number) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  const handleAddItem = () => {
    if (formType === "machine") {
      const nextId = newMachine.id || (machines.length > 0 ? Math.max(...machines.map((m) => m.id)) + 1 : 1);
      addMachine(nextId);
      setShowConfirmation(false);
    } else {
      if (
        !newEmployee.username ||
        !newEmployee.email ||
        !newEmployee.password
      ) {
        alert("Please fill in username, email, and password.");
        return;
      }

      const employee: Cashier = {
        id: Date.now(),
        username: newEmployee.username.trim(),
        email: newEmployee.email.trim(),
        password: newEmployee.password.trim(),
      };

      addCashier(employee);
      if (onAddEmployee) onAddEmployee(employee);
    }

    setShowAddForm(false);
    setNewEmployee({});
    setNewMachine({});
  };

  const handleRemoveItem = (id: number, type: "machine" | "employee") => {
    if (type === "machine") {
      removeMachine(id);
    } else {
      removeCashier(id);
      if (onRemoveEmployee) onRemoveEmployee(id);
    }
  };

  const handleQuickShiftAssign = (cashier: Cashier) => {
    const machineId = machines[0]?.id || 1;
    login(cashier.username, cashier.password, machineId);
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans text-black">
      {/* Top Header */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-6 rounded-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            Staff & Register Till Control Center
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Cashier authentication profiles, role permissions and physical register assignments
          </p>
        </div>

        <div className="flex gap-2.5 font-mono text-xs">
          <button
            onClick={() => {
              setFormType("cashier");
              setShowAddForm(true);
            }}
            className="btn-primary-pill px-4 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cashier</span>
          </button>

          <button
            onClick={() => {
              setFormType("machine");
              setShowConfirmation(true);
            }}
            className="btn-outline-light px-4 py-2 text-xs font-medium flex items-center gap-2 cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5 text-[#71717a]" />
            <span>Add Register</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Machine */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white p-6 rounded-xl border border-[#e4e4e7] card-stack-shadow max-w-sm w-full font-mono text-xs">
            <h3 className="text-black text-sm mb-1.5 font-bold uppercase tracking-wider">
              Add Register Till
            </h3>
            <p className="text-[#71717a] text-xs mb-4 font-sans">
              Enter machine/till number or let the system assign the next available terminal number.
            </p>
            <div className="mb-5">
              <label className="text-[11px] text-[#52525b] font-semibold block mb-1.5 font-sans">
                Machine Number:
              </label>
              <input
                type="number"
                placeholder={`e.g. ${machines.length + 1}`}
                className="w-full bg-white border border-[#e4e4e7] text-black px-3.5 py-2.5 rounded-md text-xs focus:outline-none focus:border-black font-mono transition-colors"
                value={newMachine.id || ""}
                onChange={(e) =>
                  setNewMachine({ id: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div className="flex gap-2.5 justify-end font-sans">
              <button
                onClick={() => setShowConfirmation(false)}
                className="btn-outline-light px-4 py-2 cursor-pointer font-medium text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="btn-primary-pill px-4 py-2 font-medium cursor-pointer text-xs transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cashier Form */}
      {showAddForm && (
        <div className="p-6 border border-[#e4e4e7] rounded-xl bg-white card-stack-shadow font-mono text-xs">
          <h3 className="text-black text-xs mb-4 font-bold uppercase tracking-wider">
            Create Staff Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#52525b] text-[11px] font-sans font-semibold">Username:</label>
              <input
                type="text"
                placeholder="e.g. nkem_cashier"
                className="bg-white text-black p-2.5 rounded-md border border-[#e4e4e7] focus:border-black text-xs focus:outline-none transition-colors"
                value={newEmployee.username || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    username: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#52525b] text-[11px] font-sans font-semibold">Email:</label>
              <input
                type="email"
                placeholder="e.g. nkem@supermarket.ng"
                className="bg-white text-black p-2.5 rounded-md border border-[#e4e4e7] focus:border-black text-xs focus:outline-none transition-colors"
                value={newEmployee.email || ""}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#52525b] text-[11px] font-sans font-semibold">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="bg-white text-black p-2.5 rounded-md border border-[#e4e4e7] focus:border-black text-xs focus:outline-none w-full pr-8 transition-colors"
                  value={newEmployee.password || ""}
                  onChange={(e) =>
                    setNewEmployee({
                      ...newEmployee,
                      password: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-5 justify-end font-sans">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewEmployee({});
                setNewMachine({});
              }}
              className="btn-outline-light px-4 py-2 text-xs cursor-pointer font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="btn-primary-pill px-4 py-2 text-xs font-medium cursor-pointer transition-all"
            >
              Save Cashier
            </button>
          </div>
        </div>
      )}

      {/* Registers Grid */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center font-mono text-xs">
          <span className="font-bold text-black uppercase tracking-wider">
            Checkout Register Terminals ({machines.length})
          </span>
          <span className="text-[11px] text-[#71717a]">
            Physical till stations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {machines.map((machine) => {
            const isCurrent = currentUser?.machineId === machine.id;
            return (
              <div
                key={machine.id}
                className={`p-3.5 rounded-xl border text-center font-mono text-xs flex flex-col justify-between transition-all min-w-0 overflow-hidden ${
                  isCurrent
                    ? "bg-[#c1fbd4]/30 border-2 border-black text-black"
                    : "bg-[#fbfbf5] border-[#e4e4e7] text-[#52525b] hover:bg-white card-stack-shadow"
                }`}
              >
                <div>
                  <div className="font-bold text-black">Machine 0{machine.id}</div>
                  <div className="text-[10px] mt-1">
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#c1fbd4] text-black font-semibold border border-[#a8f5c2]">
                        ON DUTY
                      </span>
                    ) : (
                      <span className="text-[#a1a1aa]">[READY]</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(machine.id, "machine")}
                  className="mt-3 text-[10px] text-[#71717a] hover:text-rose-600 flex items-center justify-center gap-1 font-sans cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cashier List */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#fbfbf5] border-b border-[#e4e4e7] font-mono text-xs font-bold text-black uppercase tracking-wider">
          Authorized Cashiers ({cashiers.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#fbfbf5] text-[#71717a] uppercase text-[10px] border-b border-[#e4e4e7]">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {cashiers.map((cashier) => {
                const isCurrent = currentUser?.username === cashier.username;
                return (
                  <tr key={cashier.id} className="hover:bg-[#fbfbf5] transition-colors">
                    <td className="py-3 px-4 font-bold text-black">
                      {cashier.username}
                      {cashier.username === "admin" && (
                        <span className="ml-2 text-[9px] bg-[#c1fbd4] border border-[#a8f5c2] text-black px-2 py-0.5 rounded-full font-sans font-semibold">
                          SUPERVISOR
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#52525b]">{cashier.email}</td>
                    <td className="py-3 px-4 text-[#52525b]">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {showPasswordMap[cashier.id]
                            ? cashier.password
                            : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(cashier.id)}
                          className="text-[#a1a1aa] hover:text-black cursor-pointer p-1 rounded-full hover:bg-[#e4e4e7]/50"
                        >
                          {showPasswordMap[cashier.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isCurrent ? (
                        <span className="text-[10px] text-black bg-[#c1fbd4] border border-[#a8f5c2] px-2.5 py-0.5 rounded-full font-sans font-semibold">
                          ONLINE (ON DUTY)
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#a1a1aa] font-sans">
                          OFFLINE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-2">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleQuickShiftAssign(cashier)}
                            className="btn-outline-light px-3 py-1 text-[11px] cursor-pointer font-medium transition-all"
                          >
                            Switch User
                          </button>
                        )}
                        {cashier.username !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(cashier.id, "employee")}
                            className="p-1.5 text-[#a1a1aa] hover:text-rose-600 cursor-pointer rounded-full hover:bg-[#fbfbf5] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shifts Audit */}
      <ShiftManagement machines={machines} employees={cashiers} />
    </div>
  );
}
