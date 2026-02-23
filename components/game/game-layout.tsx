"use client";

import { ResourceBar } from "./resource-bar";
import { Sidebar } from "./sidebar";
import { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Marketplace } from "./marketplace";
import { Assembly } from "./assembly";
import { DataCenter } from "./data-center";
import { Contracts } from "./contracts";
import { StaffManagement } from "./staff";
import { EventsPanel } from "./events-panel";
import { Services } from "./services";

export function GameLayout() {
  const [view, setView] = useState("dashboard");
  const { state } = useGame();

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      <Sidebar currentView={view} setView={setView} />
      <div className="flex flex-col flex-1 h-full min-w-0 pb-16 md:pb-0 relative">
        <ResourceBar />
        <EventsPanel />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-900/50">
          {view === "dashboard" && (
            <div className="space-y-6 pb-20">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider">Total Servers</h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    {state.racks.reduce((acc, r) => {
                        if (r.type === 'rack') return acc + r.servers.filter(s => s !== null).length;
                        return acc;
                    }, 0)}
                  </p>
                </div>
                 <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider">Active Contracts</h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    {state.contracts.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
                  <h3 className="text-sm text-slate-400 uppercase tracking-wider">Racks Owned</h3>
                  <p className="text-3xl font-bold text-white mt-2">
                    {state.racks.filter(r => r.type === 'rack').length}
                  </p>
                </div>
              </div>
            </div>
          )}
          {view === "racks" && <DataCenter />}
          {view === "services" && <Services />}
          {view === "contracts" && <Contracts />}
          {view === "staff" && <StaffManagement />}
          {view === "market" && <Marketplace />}
          {view === "assembly" && <Assembly />}
        </main>
      </div>
    </div>
  );
}
