"use client";

import { useGame } from "@/lib/game-store";
import { Users, UserPlus, UserMinus, Shield, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function StaffManagement() {
  const { state, dispatch } = useGame();

  const technicians = state.staff.filter(s => s.role === 'technician');
  const security = state.staff.filter(s => s.role === 'security');
  const managers = state.staff.filter(s => s.role === 'manager');

  const hireCost = 100000;

  const hire = (role: 'technician' | 'manager' | 'security') => {
      if (state.resources.money >= hireCost) {
          dispatch({ type: "HIRE_STAFF", role });
      }
  };

  const fire = (id: string) => {
      if (confirm("Are you sure you want to fire this employee?")) {
          dispatch({ type: "FIRE_STAFF", staffId: id });
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users className="w-6 h-6" /> Staff Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Technicians */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Wrench className="w-5 h-5 text-blue-400" /> Technicians</h3>
                  <button
                    onClick={() => hire('technician')}
                    disabled={state.resources.money < hireCost}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 px-3 py-1 rounded text-xs font-bold transition-colors"
                  >
                      <UserPlus className="w-4 h-4" /> Hire ({hireCost.toLocaleString()})
                  </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">Technicians automatically repair damaged servers. More skill = faster repairs.</p>

              <div className="space-y-3">
                  {technicians.length === 0 && <p className="text-slate-500 text-sm italic">No technicians hired.</p>}
                  {technicians.map(staff => (
                      <div key={staff.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                          <div>
                              <div className="font-bold text-white">{staff.name}</div>
                              <div className="text-xs text-slate-500">Skill: {staff.skill} • Salary: {staff.salary}/tick</div>
                          </div>
                          <button onClick={() => fire(staff.id)} className="text-red-500 hover:text-red-400 p-1"><UserMinus className="w-4 h-4" /></button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Security (Future) */}
           <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 opacity-80">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-red-400" /> Security</h3>
                  <button
                    onClick={() => hire('security')}
                    disabled={state.resources.money < hireCost}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 px-3 py-1 rounded text-xs font-bold transition-colors"
                  >
                      <UserPlus className="w-4 h-4" /> Hire ({hireCost.toLocaleString()})
                  </button>
              </div>
               <p className="text-sm text-slate-400 mb-4">Security guards protect against physical sabotage and mitigate some cyber threats.</p>
               <div className="space-y-3">
                  {security.length === 0 && <p className="text-slate-500 text-sm italic">No security staff hired.</p>}
                   {security.map(staff => (
                      <div key={staff.id} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                          <div>
                              <div className="font-bold text-white">{staff.name}</div>
                              <div className="text-xs text-slate-500">Skill: {staff.skill} • Salary: {staff.salary}/tick</div>
                          </div>
                          <button onClick={() => fire(staff.id)} className="text-red-500 hover:text-red-400 p-1"><UserMinus className="w-4 h-4" /></button>
                      </div>
                  ))}
               </div>
          </div>
      </div>
    </div>
  );
}
