"use client";

import { LayoutDashboard, Server, Wrench, ShoppingCart, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export function Sidebar({ currentView, setView }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "racks", label: "Data Center", icon: Server },
    { id: "contracts", label: "Contracts", icon: FileText },
    { id: "staff", label: "Staff", icon: Users },
    { id: "assembly", label: "Assembly", icon: Wrench },
    { id: "market", label: "Market", icon: ShoppingCart },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-slate-950 border-r border-slate-800 flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-900 flex items-center gap-3">
          <Server className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight leading-none">DC Tycoon</h1>
            <p className="text-xs text-slate-500 mt-1">Simulation Beta</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium",
                currentView === item.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-900">
          <div className="text-xs text-slate-600 text-center">
              v0.1.0 Alpha
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 z-50 flex justify-between px-2 pb-safe">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 rounded-md transition-colors",
                 currentView === item.id
                  ? "text-blue-500"
                  : "text-slate-500"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
      </div>
    </>
  );
}
