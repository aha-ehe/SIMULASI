"use client";

import { useGame } from "@/lib/game-store";
import { useState } from "react";
import { Component } from "@/lib/types";
import { Cpu, Box, Disc, Power } from "lucide-react";

export function Assembly() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState("Server 1");
  const [selectedCpu, setSelectedCpu] = useState<Component | null>(null);
  const [selectedRam, setSelectedRam] = useState<Component | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<Component | null>(null);
  const [selectedPsu, setSelectedPsu] = useState<Component | null>(null);

  const availableCpus = state.inventory.components.filter((c) => c.type === "cpu");
  const availableRams = state.inventory.components.filter((c) => c.type === "ram");
  const availableStorages = state.inventory.components.filter((c) => c.type === "storage");
  const availablePsus = state.inventory.components.filter((c) => c.type === "psu");

  const totalPower = (selectedCpu?.specs.power || 0) + (selectedRam?.specs.power || 0) + (selectedStorage?.specs.power || 0);
  const psuCapacity = selectedPsu?.specs.power || 0; // Using power as capacity for PSU
  const isValid = selectedCpu && selectedRam && selectedStorage && selectedPsu && totalPower <= psuCapacity;

  const handleAssemble = () => {
    if (isValid && selectedCpu && selectedRam && selectedStorage && selectedPsu) {
      dispatch({
        type: "ASSEMBLE_SERVER",
        name,
        components: {
          cpu: selectedCpu,
          ram: selectedRam,
          storage: selectedStorage,
          psu: selectedPsu,
        },
      });
      // Reset
      setSelectedCpu(null);
      setSelectedRam(null);
      setSelectedStorage(null);
      setSelectedPsu(null);
      setName("Server " + (state.inventory.servers.length + 2));
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Box className="w-6 h-6" /> Server Assembly
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Server Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <ComponentSelect label="CPU" icon={Cpu} items={availableCpus} selected={selectedCpu} onSelect={setSelectedCpu} />
          <ComponentSelect label="RAM" icon={Box} items={availableRams} selected={selectedRam} onSelect={setSelectedRam} />
          <ComponentSelect label="Storage" icon={Disc} items={availableStorages} selected={selectedStorage} onSelect={setSelectedStorage} />
          <ComponentSelect label="PSU" icon={Power} items={availablePsus} selected={selectedPsu} onSelect={setSelectedPsu} />
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 h-fit">
          <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Build Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Power Consumption:</span>
              <span className={psuCapacity > 0 && totalPower > psuCapacity ? "text-red-500 font-bold" : "text-white"}>
                {totalPower} W
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PSU Capacity:</span>
              <span className="text-white">{psuCapacity} W</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heat Generation:</span>
              <span className="text-white">
                {(selectedCpu?.specs.heat || 0) + (selectedRam?.specs.heat || 0) + (selectedStorage?.specs.heat || 0)}
              </span>
            </div>
             <div className="flex justify-between">
              <span className="text-slate-400">Performance:</span>
              <span className="text-white font-bold text-lg">
                {(selectedCpu?.specs.performance || 0) + (selectedRam?.specs.performance || 0) + (selectedStorage?.specs.performance || 0)} Pts
              </span>
            </div>
          </div>

          <button
            onClick={handleAssemble}
            disabled={!isValid}
            className="w-full mt-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 rounded font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Assemble Server
          </button>

          {!isValid && psuCapacity > 0 && totalPower > psuCapacity && (
              <p className="text-red-500 text-xs mt-2 text-center">Power consumption exceeds PSU capacity!</p>
          )}
           {!isValid && (!selectedCpu || !selectedRam || !selectedStorage || !selectedPsu) && (
              <p className="text-yellow-500 text-xs mt-2 text-center">Missing components</p>
          )}
        </div>
      </div>

       <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 border-b border-slate-800 pb-2">Inventory (Unused Components)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {state.inventory.components.length === 0 && <p className="text-slate-500 col-span-4">No components in inventory. Buy some from the Market!</p>}
                {state.inventory.components.map((c) => (
                    <div key={c.id} className="bg-slate-800 p-3 rounded border border-slate-700 text-xs flex justify-between items-center">
                        <div>
                            <span className="font-bold text-slate-300 block">{c.name}</span>
                            <span className="text-slate-500 uppercase text-[10px]">{c.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-8">
             <h3 className="text-xl font-bold mb-4 border-b border-slate-800 pb-2">Assembled Servers</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {state.inventory.servers.length === 0 && <p className="text-slate-500 col-span-3">No assembled servers ready.</p>}
                 {state.inventory.servers.map((s) => (
                     <div key={s.id} className="bg-slate-800 p-4 rounded border border-slate-700">
                         <h4 className="font-bold text-white">{s.name}</h4>
                         <div className="text-xs text-slate-400 mt-2 space-y-1">
                             <div>CPU: {s.components.cpu.name}</div>
                             <div>RAM: {s.components.ram.name}</div>
                             <div>Power: {s.stats.power}W</div>
                             <div>Perf: {s.stats.compute}</div>
                         </div>
                         <div className="mt-2 text-xs bg-yellow-900/50 text-yellow-500 px-2 py-1 rounded w-fit">
                             Ready to Deploy
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );
}

function ComponentSelect({ label, icon: Icon, items, selected, onSelect }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
        <Icon className="w-4 h-4" /> {label}
      </label>
      <select
        value={selected ? selected.id : ""}
        onChange={(e) => {
            const item = items.find((i: Component) => i.id === e.target.value);
            onSelect(item || null);
        }}
        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
      >
        <option value="">Select {label}...</option>
        {items.map((item: Component) => (
          <option key={item.id} value={item.id}>
            {item.name} - {label === 'PSU' ? `${item.specs.power}W Capacity` : `${item.specs.power}W`}
          </option>
        ))}
      </select>
       {items.length === 0 && (
          <p className="text-xs text-red-400 mt-1">No {label} available.</p>
      )}
    </div>
  );
}
