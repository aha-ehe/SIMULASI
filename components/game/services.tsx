"use client";

import { useGame } from "@/lib/game-store";
import { useState } from "react";
import { Cloud, Server, Play, Square, Trash2, Plus, Terminal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Services() {
  const { state, dispatch } = useGame();
  const [view, setView] = useState<'list' | 'create'>('list');

  // Create Form State
  const [selectedServerId, setSelectedServerId] = useState("");
  const [vCpu, setVCpu] = useState(1);
  const [ram, setRam] = useState(1);
  const [storage, setStorage] = useState(10);
  const [os, setOs] = useState("Ubuntu 22.04");
  const [price, setPrice] = useState(50);

  const activeServers = state.racks
    .filter(r => r.type === 'rack')
    .flatMap(r => r.servers)
    .filter(s => s && s.status === 'active' && s.health > 0 && s.installedSoftware.some(sw => sw.type === 'os'));

  const totalRevenue = state.instances.reduce((acc, i) => (i.client && i.status === 'running') ? acc + i.price : acc, 0);
  const activeInstances = state.instances.filter(i => i.status === 'running').length;

  const handleCreate = () => {
      if (!selectedServerId) return;
      dispatch({
          type: 'CREATE_INSTANCE',
          serverId: selectedServerId,
          specs: { vCpu, ram, storage, os },
          price
      });
      setView('list');
  };

  const selectedServer = activeServers.find(s => s?.id === selectedServerId);
  const usedResources = state.instances.filter(i => i.serverId === selectedServerId).reduce((acc, i) => ({
      cpu: acc.cpu + i.specs.vCpu,
      ram: acc.ram + i.specs.ram,
      storage: acc.storage + i.specs.storage
  }), { cpu: 0, ram: 0, storage: 0 });

  return (
    <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-400" /> Cloud Console
            </h2>
            {view === 'list' && (
                <button
                    onClick={() => setView('create')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create Instance
                </button>
            )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="text-xs text-slate-400 uppercase">Active Instances</div>
                <div className="text-2xl font-bold text-white">{activeInstances} / {state.instances.length}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="text-xs text-slate-400 uppercase">Hourly Revenue</div>
                <div className="text-2xl font-bold text-green-400">IDR {totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="text-xs text-slate-400 uppercase">Utilization</div>
                <div className="text-2xl font-bold text-blue-400">
                    {state.instances.length > 0 ? ((activeInstances / state.instances.length) * 100).toFixed(0) : 0}%
                </div>
            </div>
        </div>

        {view === 'create' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold">New Cloud Instance</h3>
                    <button onClick={() => setView('list')}><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Host Server</label>
                            <select
                                value={selectedServerId}
                                onChange={(e) => setSelectedServerId(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                            >
                                <option value="">-- Select Server --</option>
                                {activeServers.map(s => s && (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedServer && (
                             <div className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
                                 <div>Capacity: {selectedServer.components.cpu.specs.cores} vCPU, {selectedServer.components.ram.specs.capacity} GB RAM</div>
                                 <div className="mt-1">
                                     Used: {usedResources.cpu} vCPU, {usedResources.ram} GB RAM
                                 </div>
                             </div>
                        )}

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Operating System</label>
                            <select value={os} onChange={(e) => setOs(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white">
                                <option>Ubuntu 22.04 LTS</option>
                                <option>Debian 11</option>
                                <option>CentOS Stream 9</option>
                                <option>Windows Server 2022</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Hourly Rate (IDR)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Market Avg: IDR {(vCpu * 50 + ram * 20).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">vCPU Cores: {vCpu}</label>
                            <input type="range" min="1" max="64" value={vCpu} onChange={(e) => setVCpu(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">RAM (GB): {ram}</label>
                            <input type="range" min="1" max="128" value={ram} onChange={(e) => setRam(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Storage (GB): {storage}</label>
                            <input type="range" min="10" max="1000" step="10" value={storage} onChange={(e) => setStorage(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleCreate}
                                disabled={!selectedServer}
                                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white font-bold py-3 rounded"
                            >
                                Launch Instance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {view === 'list' && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 font-medium">
                        <tr>
                            <th className="p-3">Instance Name</th>
                            <th className="p-3 hidden md:table-cell">Specs</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Client</th>
                            <th className="p-3 text-right">Revenue</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {state.instances.length === 0 && (
                            <tr><td colSpan={6} className="p-4 text-center text-slate-500">No active instances.</td></tr>
                        )}
                        {state.instances.map(inst => (
                            <tr key={inst.id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="p-3 font-bold text-white flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-slate-500" />
                                    {inst.name}
                                </td>
                                <td className="p-3 text-slate-400 hidden md:table-cell">
                                    {inst.specs.vCpu} vCPU, {inst.specs.ram} GB
                                </td>
                                <td className="p-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                                        inst.status === 'running' ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                                    )}>
                                        {inst.status}
                                    </span>
                                </td>
                                <td className="p-3 text-slate-300">
                                    {inst.client ? inst.client : <span className="text-slate-600 italic">Waiting...</span>}
                                </td>
                                <td className="p-3 text-right font-mono text-green-400">
                                    {inst.client ? `+${inst.price}` : '0'}
                                </td>
                                <td className="p-3 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => dispatch({
                                            type: 'UPDATE_INSTANCE_STATUS',
                                            instanceId: inst.id,
                                            status: inst.status === 'running' ? 'stopped' : 'running'
                                        })}
                                        className="p-1 hover:bg-slate-600 rounded text-slate-300"
                                        title={inst.status === 'running' ? "Stop" : "Start"}
                                    >
                                        {inst.status === 'running' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'DELETE_INSTANCE', instanceId: inst.id })}
                                        className="p-1 hover:bg-red-900/50 rounded text-red-400"
                                        title="Terminate"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}
