"use client";

import { useGame } from "@/lib/game-store";
import { useState } from "react";
import { Server, Users, DollarSign, Activity, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Services() {
  const { state, dispatch } = useGame();
  const [selectedServerId, setSelectedServerId] = useState<string>("");

  const activeServers = state.racks
    .filter(r => r.type === 'rack')
    .flatMap(r => r.servers)
    .filter(s => s && s.status === 'active' && s.health > 0 && s.installedSoftware.some(sw => sw.type === 'os'));

  const clients = state.clients;
  const totalRevenue = clients.reduce((acc, c) => acc + c.revenue, 0);

  const handleProvision = (tier: 'basic' | 'business' | 'enterprise') => {
      if (!selectedServerId) return;
      dispatch({ type: 'PROVISION_VPS', serverId: selectedServerId, tier });
  };

  const selectedServer = activeServers.find(s => s?.id === selectedServerId);

  // Calculate usage for selected server
  const serverClients = clients.filter(c => c.serverId === selectedServerId);
  const usedResources = serverClients.reduce((acc, c) => ({
        cpu: acc.cpu + c.resourceUsage.cpu,
        ram: acc.ram + c.resourceUsage.ram,
        storage: acc.storage + c.resourceUsage.storage
  }), { cpu: 0, ram: 0, storage: 0 });

  const tiers = [
      { id: 'basic', name: 'Basic VPS', price: 10, req: { cpu: 1, ram: 1, storage: 10 } },
      { id: 'business', name: 'Business VPS', price: 50, req: { cpu: 4, ram: 4, storage: 50 } },
      { id: 'enterprise', name: 'Enterprise VPS', price: 200, req: { cpu: 8, ram: 16, storage: 200 } },
  ];

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="w-6 h-6" /> Services & VPS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dashboard Stats */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Active Clients</div>
              <div className="text-3xl font-bold text-white">{clients.length}</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">VPS Revenue</div>
              <div className="text-3xl font-bold text-green-400 flex items-center gap-1">
                  <DollarSign className="w-6 h-6" /> {totalRevenue.toLocaleString()}/t
              </div>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Available Servers</div>
              <div className="text-3xl font-bold text-blue-400">{activeServers.length}</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Provisioning */}
          <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2">Provision New VPS</h3>

              <div className="space-y-2">
                  <label className="text-sm text-slate-400">Select Host Server</label>
                  <select
                    value={selectedServerId}
                    onChange={(e) => setSelectedServerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white"
                  >
                      <option value="">-- Select Server --</option>
                      {activeServers.map(s => s && (
                          <option key={s.id} value={s.id}>{s.name} ({s.components.cpu.specs.cores}c / {s.components.ram.specs.capacity}GB)</option>
                      ))}
                  </select>
              </div>

              {selectedServer && (
                  <div className="bg-slate-900 p-4 rounded border border-slate-800 text-sm">
                      <h4 className="font-bold text-white mb-2">Server Status: {selectedServer.name}</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                          <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-500 block">CPU Usage</span>
                              <span className={usedResources.cpu >= (selectedServer.components.cpu.specs.cores || 0) ? "text-red-400" : "text-white"}>
                                {usedResources.cpu} / {selectedServer.components.cpu.specs.cores} Cores
                              </span>
                          </div>
                          <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-500 block">RAM Usage</span>
                              <span className={usedResources.ram >= (selectedServer.components.ram.specs.capacity || 0) ? "text-red-400" : "text-white"}>
                                {usedResources.ram} / {selectedServer.components.ram.specs.capacity} GB
                              </span>
                          </div>
                          <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-500 block">Storage</span>
                              <span className={usedResources.storage >= (selectedServer.components.storage.specs.capacity || 0) ? "text-red-400" : "text-white"}>
                                {usedResources.storage} / {selectedServer.components.storage.specs.capacity} GB
                              </span>
                          </div>
                      </div>

                      <div className="space-y-2">
                          {tiers.map(tier => {
                              const canAfford =
                                usedResources.cpu + tier.req.cpu <= (selectedServer.components.cpu.specs.cores || 0) &&
                                usedResources.ram + tier.req.ram <= (selectedServer.components.ram.specs.capacity || 0) &&
                                usedResources.storage + tier.req.storage <= (selectedServer.components.storage.specs.capacity || 0);

                              return (
                                <button
                                    key={tier.id}
                                    onClick={() => handleProvision(tier.id as 'basic' | 'business' | 'enterprise')}
                                    disabled={!canAfford}
                                    className="w-full flex justify-between items-center bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded border border-slate-700 transition-colors"
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-white">{tier.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {tier.req.cpu}c • {tier.req.ram}GB • {tier.req.storage}GB
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-bold">
                                        +{tier.price}/t
                                    </div>
                                </button>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>

          {/* Active Clients List */}
          <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2">Client List</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {clients.length === 0 && <p className="text-slate-500 text-center py-4">No active clients.</p>}
                  {clients.map(client => (
                      <div key={client.id} className="bg-slate-800 p-3 rounded border border-slate-700 flex justify-between items-center">
                          <div>
                              <div className="font-bold text-white text-sm">{client.name}</div>
                              <div className="text-xs text-slate-500 uppercase">{client.tier} tier</div>
                          </div>
                          <button
                            onClick={() => dispatch({ type: 'TERMINATE_VPS', clientId: client.id })}
                            className="text-slate-500 hover:text-red-500 p-2"
                          >
                              <X className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
