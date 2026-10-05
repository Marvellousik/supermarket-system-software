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
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 shadow-xs p-3.5 rounded-lg flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Staff & Register Till Control Center
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Cashier authentication profiles, role permissions and physical register assignments
          </p>
        </div>

        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={() => {
              setFormType("cashier");
              setShowAddForm(true);
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cashier</span>
          </button>

          <button
            onClick={() => {
              setFormType("machine");
              setShowConfirmation(true);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs text-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Monitor className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Register</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Machine */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xl max-w-sm w-full font-mono text-xs">
            <h3 className="text-slate-900 text-sm mb-1.5 font-bold uppercase">
              Add Register Till
            </h3>
            <p className="text-slate-500 text-xs mb-3 font-sans">
              Enter machine/till number or let the system assign the next available terminal number.
            </p>
            <div className="mb-4">
              <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                Machine Number:
              </label>
              <input
                type="number"
                placeholder={`e.g. ${machines.length + 1}`}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-3 py-2 rounded-md text-xs focus:outline-none focus:border-emerald-600 font-mono shadow-xs"
                value={newMachine.id || ""}
                onChange={(e) =>
                  setNewMachine({ id: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md shadow-xs cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cashier Form */}
      {showAddForm && (
        <div className="p-4 border border-slate-200 rounded-lg bg-white shadow-xs font-mono text-xs">
          <h3 className="text-slate-900 text-xs mb-3 font-bold uppercase">
            Create Staff Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-slate-600 text-[11px] font-semibold">Username:</label>
              <input
                type="text"
                placeholder="e.g. nkem_cashier"
                className="bg-slate-50 text-slate-900 p-2 rounded-md border border-slate-300 focus:bg-white focus:border-emerald-600 text-xs focus:outline-none shadow-xs"
                value={newEmployee.username || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    username: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-600 text-[11px] font-semibold">Email:</label>
              <input
                type="email"
                placeholder="e.g. nkem@supermarket.ng"
                className="bg-slate-50 text-slate-900 p-2 rounded-md border border-slate-300 focus:bg-white focus:border-emerald-600 text-xs focus:outline-none shadow-xs"
                value={newEmployee.email || ""}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-600 text-[11px] font-semibold">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="bg-slate-50 text-slate-900 p-2 rounded-md border border-slate-300 focus:bg-white focus:border-emerald-600 text-xs focus:outline-none w-full pr-8 shadow-xs"
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3.5 justify-end font-sans">
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewEmployee({});
                setNewMachine({});
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Cashier
            </button>
          </div>
        </div>
      )}

      {/* Registers Grid */}
      <div className="bg-white border border-slate-200 shadow-xs p-3.5 rounded-lg space-y-2.5">
        <div className="flex justify-between items-center font-mono text-xs">
          <span className="font-bold text-slate-900 uppercase">
            Checkout Register Terminals ({machines.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Physical till stations
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {machines.map((machine) => {
            const isCurrent = currentUser?.machineId === machine.id;
            return (
              <div
                key={machine.id}
                className={`p-2.5 rounded-lg border text-center font-mono text-xs flex flex-col justify-between shadow-2xs ${
                  isCurrent
                    ? "bg-emerald-50/80 border-2 border-emerald-600 text-emerald-900"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Machine 0{machine.id}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isCurrent ? "[ASSIGNED]" : "[READY]"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(machine.id, "machine")}
                  className="mt-2 text-[10px] text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1 font-sans cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cashier List */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase">
          Authorized Cashiers ({cashiers.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Password</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashiers.map((cashier) => {
                const isCurrent = currentUser?.username === cashier.username;
                return (
                  <tr key={cashier.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {cashier.username}
                      {cashier.username === "admin" && (
                        <span className="ml-1.5 text-[9px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-sans font-semibold">
                          SUPERVISOR
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{cashier.email}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {showPasswordMap[cashier.id]
                            ? cashier.password
                            : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(cashier.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPasswordMap[cashier.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {isCurrent ? (
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-sans font-bold">
                          ONLINE (ON DUTY)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-sans">
                          OFFLINE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleQuickShiftAssign(cashier)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] rounded shadow-2xs cursor-pointer font-medium"
                          >
                            Switch User
                          </button>
                        )}
                        {cashier.username !== "admin" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(cashier.id, "employee")}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
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
