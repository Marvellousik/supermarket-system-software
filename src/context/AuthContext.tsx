"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Cashier, Machine, UserSession } from "@/types/Entities";
import type { Shift } from "@/types/Shift";

interface ActiveShiftInfo {
  id: number;
  machineId: number;
  cashierId: number;
  cashierName: string;
  startTime: string;
}

interface AuthContextType {
  currentUser: UserSession | null;
  activeShift: ActiveShiftInfo | null;
  activeMachineId: number;
  switchMachine: (machineId: number) => void;
  cashiers: Cashier[];
  machines: Machine[];
  shifts: Shift[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  login: (
    username: string,
    password: string,
    machineId?: number
  ) => { success: boolean; message?: string };
  logout: () => void;
  startShift: (machineId: number) => void;
  endShift: () => void;
  addCashier: (cashier: Cashier) => void;
  removeCashier: (cashierId: number) => void;
  addMachine: (machineId: number) => void;
  removeMachine: (machineId: number) => void;
}

const DEFAULT_MACHINES: Machine[] = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
];

const DEFAULT_CASHIERS: Cashier[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@supermarket.ng",
    password: "admin",
  },
  {
    id: 2,
    username: "chioma",
    email: "chioma.e@supermarket.ng",
    password: "password123",
  },
  {
    id: 3,
    username: "emeka",
    email: "emeka.o@supermarket.ng",
    password: "password123",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveShiftInfo | null>(null);
  const [activeMachineId, setActiveMachineId] = useState<number>(1);
  const [cashiers, setCashiers] = useState<Cashier[]>(DEFAULT_CASHIERS);
  const [machines, setMachines] = useState<Machine[]>(DEFAULT_MACHINES);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load state and fetch from SQLite APIs on startup
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedUser = localStorage.getItem("sm_current_user");
      const savedShift = localStorage.getItem("sm_active_shift");
      const savedMachine = localStorage.getItem("sm_active_machine");
      const savedCashiers = localStorage.getItem("sm_cashiers");
      const savedMachines = localStorage.getItem("sm_machines");
      const savedShifts = localStorage.getItem("sm_shifts");
      const savedSound = localStorage.getItem("sm_sound_enabled");

      if (savedCashiers) setCashiers(JSON.parse(savedCashiers));
      if (savedMachines) setMachines(JSON.parse(savedMachines));
      if (savedShifts) setShifts(JSON.parse(savedShifts));
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const initialMachine = savedMachine ? parseInt(savedMachine, 10) : 1;
      setActiveMachineId(initialMachine);

      if (savedUser) {
        const userObj: UserSession = JSON.parse(savedUser);
        userObj.machineId = initialMachine;
        setCurrentUser(userObj);
        if (savedShift) {
          const shiftObj = JSON.parse(savedShift);
          shiftObj.machineId = initialMachine;
          setActiveShift(shiftObj);
        } else {
          setActiveShift({
            id: Date.now(),
            machineId: initialMachine,
            cashierId: userObj.id,
            cashierName: userObj.username,
            startTime: userObj.shiftStartTime || new Date().toISOString(),
          });
        }
      } else {
        // Startup default admin session on Machine 1
        const defaultAdminSession: UserSession = {
          id: 1,
          username: "admin",
          email: "admin@supermarket.ng",
          role: "admin",
          machineId: initialMachine,
          shiftStartTime: new Date().toISOString(),
        };
        const defaultShift: ActiveShiftInfo = {
          id: 101,
          machineId: initialMachine,
          cashierId: 1,
          cashierName: "admin",
          startTime: defaultAdminSession.shiftStartTime,
        };
        setCurrentUser(defaultAdminSession);
        setActiveShift(defaultShift);
        localStorage.setItem("sm_current_user", JSON.stringify(defaultAdminSession));
        localStorage.setItem("sm_active_shift", JSON.stringify(defaultShift));
        localStorage.setItem("sm_active_machine", initialMachine.toString());
      }
    } catch (e) {
      console.error("Session restoration error", e);
    } finally {
      setIsInitialized(true);
    }

    // Attempt to sync machines from SQLite backend
    fetch("/api/machines")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.machines) && data.machines.length > 0) {
          setMachines(data.machines);
        }
      })
      .catch(() => {
        // Fallback to local state if backend route unavailable
      });

    // Attempt to sync shifts from SQLite backend
    fetch("/api/shifts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.shifts)) {
          setShifts(data.shifts);
        }
      })
      .catch(() => {
        // Fallback to local state
      });
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("sm_cashiers", JSON.stringify(cashiers));
  }, [cashiers, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("sm_machines", JSON.stringify(machines));
  }, [machines, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("sm_shifts", JSON.stringify(shifts));
  }, [shifts, isInitialized]);

  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    localStorage.setItem("sm_sound_enabled", soundEnabled ? "true" : "false");
  }, [soundEnabled, isInitialized]);

  // Direct machine switching for POS terminal
  const switchMachine = useCallback((machineId: number) => {
    setActiveMachineId(machineId);
    if (typeof window !== "undefined") {
      localStorage.setItem("sm_active_machine", machineId.toString());
    }

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, machineId };
      if (typeof window !== "undefined") {
        localStorage.setItem("sm_current_user", JSON.stringify(updated));
      }
      return updated;
    });

    setActiveShift((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, machineId };
      if (typeof window !== "undefined") {
        localStorage.setItem("sm_active_shift", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const login = (
    usernameInput: string,
    passwordInput: string,
    machineIdInput: number = 1
  ): { success: boolean; message?: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const isAdminUser = cleanUser === "admin";
    const isAdminPass = cleanPass === "admin" || cleanPass === "123456789";

    let authenticatedCashier: Cashier | null = null;
    let role: "admin" | "cashier" = "cashier";

    if (isAdminUser && isAdminPass) {
      authenticatedCashier = {
        id: 1,
        username: "admin",
        email: "admin@supermarket.ng",
        password: cleanPass,
      };
      role = "admin";
    } else {
      const found = cashiers.find(
        (c) =>
          c.username.toLowerCase() === cleanUser && c.password === cleanPass
      );
      if (found) {
        authenticatedCashier = found;
        role = found.username.toLowerCase() === "admin" ? "admin" : "cashier";
      }
    }

    if (!authenticatedCashier) {
      return {
        success: false,
        message:
          "Invalid credentials. Default: admin / admin or admin / 123456789",
      };
    }

    const assignedMachineId = machineIdInput || activeMachineId || 1;
    const nowTime = new Date().toISOString();

    const session: UserSession = {
      id: authenticatedCashier.id,
      username: authenticatedCashier.username,
      email: authenticatedCashier.email,
      role: role,
      machineId: assignedMachineId,
      shiftStartTime: nowTime,
    };

    const newShift: ActiveShiftInfo = {
      id: Date.now(),
      machineId: assignedMachineId,
      cashierId: authenticatedCashier.id,
      cashierName: authenticatedCashier.username,
      startTime: nowTime,
    };

    setActiveMachineId(assignedMachineId);
    setCurrentUser(session);
    setActiveShift(newShift);

    const shiftRecord: Shift = {
      id: newShift.id,
      machineId: assignedMachineId,
      cashierId: authenticatedCashier.id,
      startTime: nowTime,
      endTime: "",
    };
    setShifts((prev) => [shiftRecord, ...prev]);

    if (typeof window !== "undefined") {
      localStorage.setItem("sm_active_machine", assignedMachineId.toString());
      localStorage.setItem("sm_current_user", JSON.stringify(session));
      localStorage.setItem("sm_active_shift", JSON.stringify(newShift));
    }

    // Log to SQLite backend
    fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machineId: assignedMachineId,
        cashierId: authenticatedCashier.id,
        cashierName: authenticatedCashier.username,
        startTime: nowTime,
      }),
    }).catch(() => {});

    return { success: true };
  };

  const logout = () => {
    if (activeShift) {
      const nowTime = new Date().toISOString();
      setShifts((prev) =>
        prev.map((s) =>
          s.id === activeShift.id && !s.endTime ? { ...s, endTime: nowTime } : s
        )
      );

      // Close shift in SQLite backend
      fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "end",
          machineId: activeShift.machineId,
          cashierId: activeShift.cashierId,
        }),
      }).catch(() => {});
    }
    setCurrentUser(null);
    setActiveShift(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sm_current_user");
      localStorage.removeItem("sm_active_shift");
    }
  };

  const startShift = (machineId: number) => {
    if (!currentUser) return;
    const nowTime = new Date().toISOString();
    const updatedUser: UserSession = {
      ...currentUser,
      machineId,
      shiftStartTime: nowTime,
    };
    const newShift: ActiveShiftInfo = {
      id: Date.now(),
      machineId,
      cashierId: currentUser.id,
      cashierName: currentUser.username,
      startTime: nowTime,
    };

    setActiveMachineId(machineId);
    setCurrentUser(updatedUser);
    setActiveShift(newShift);

    const shiftRecord: Shift = {
      id: newShift.id,
      machineId,
      cashierId: currentUser.id,
      startTime: nowTime,
      endTime: "",
    };
    setShifts((prev) => [shiftRecord, ...prev]);

    if (typeof window !== "undefined") {
      localStorage.setItem("sm_active_machine", machineId.toString());
      localStorage.setItem("sm_current_user", JSON.stringify(updatedUser));
      localStorage.setItem("sm_active_shift", JSON.stringify(newShift));
    }

    fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machineId,
        cashierId: currentUser.id,
        cashierName: currentUser.username,
        startTime: nowTime,
      }),
    }).catch(() => {});
  };

  const endShift = () => {
    if (activeShift) {
      const nowTime = new Date().toISOString();
      setShifts((prev) =>
        prev.map((s) =>
          s.id === activeShift.id ? { ...s, endTime: nowTime } : s
        )
      );

      fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "end",
          machineId: activeShift.machineId,
          cashierId: activeShift.cashierId,
        }),
      }).catch(() => {});
    }
    setActiveShift(null);
    if (currentUser) {
      const updatedUser = { ...currentUser, shiftStartTime: "" };
      setCurrentUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("sm_current_user", JSON.stringify(updatedUser));
        localStorage.removeItem("sm_active_shift");
      }
    }
  };

  const addCashier = (cashier: Cashier) => {
    setCashiers((prev) => [...prev, cashier]);
  };

  const removeCashier = (cashierId: number) => {
    setCashiers((prev) => prev.filter((c) => c.id !== cashierId));
  };

  const addMachine = (machineId: number) => {
    if (machines.some((m) => m.id === machineId)) return;
    const newMachine = { id: machineId };
    setMachines((prev) => [...prev, newMachine]);

    fetch("/api/machines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: machineId, name: `Terminal 0${machineId}` }),
    }).catch(() => {});
  };

  const removeMachine = (machineId: number) => {
    setMachines((prev) => prev.filter((m) => m.id !== machineId));
    fetch(`/api/machines?id=${machineId}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeShift,
        activeMachineId,
        switchMachine,
        cashiers,
        machines,
        shifts,
        soundEnabled,
        setSoundEnabled,
        login,
        logout,
        startShift,
        endShift,
        addCashier,
        removeCashier,
        addMachine,
        removeMachine,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
