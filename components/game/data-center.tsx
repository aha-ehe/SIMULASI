"use client";

import { useGame } from "@/lib/game-store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Component, Server as ServerType, Rack } from "@/lib/types";
import { Server, X, Plus, Snowflake, Lock, Terminal, Shield, Battery, Zap } from "lucide-react";
import { SOFTWARE_CATALOG } from "@/lib/software-catalog";

export function DataCenter() {
  const { state, dispatch } = useGame();
  const [selectedItemToPlace, setSelectedItemToPlace] = useState<Component | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  const handleCellClick = (x: number, y: number) => {
    // Check if tile is unlocked
    const tile = state.grid.find(t => t.x === x && t.y === y);
    if (!tile) return;

    if (!tile.unlocked) {
        // Prompt to unlock? For now, just instant unlock if money
        if (state.resources.money >= tile.price) {
            if (confirm(`Unlock tile for ${tile.price.toLocaleString()} IDR?`)) {
                dispatch({ type: "UNLOCK_TILE", x, y });
            }
        } else {
            alert(`Need ${tile.price.toLocaleString()} IDR to unlock.`);
        }
        return;
    }

    if (selectedItemToPlace) {
      dispatch({
        type: "PLACE_ITEM",
        itemComponent: selectedItemToPlace,
        position: { x, y },
      });
      setSelectedItemToPlace(null);
    }
  };

  const getRackAt = (x: number, y: number) => {
    return state.racks.find((r) => r.position.x === x && r.position.y === y);
  };

  // Sort grid by Y then X
  const sortedGrid = [...state.grid].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const rows = 6;
  const cols = 6;

  const inventoryItems = state.inventory.components.filter(c => ['rack', 'cooling', 'ups', 'generator'].includes(c.type));
  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative">
      <div className="flex-1 bg-slate-900 rounded-lg p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-auto">
         <h2 className="absolute top-6 left-6 text-2xl font-bold flex items-center gap-2 z-10">
            <Server className="w-6 h-6" /> Data Center Floor
         </h2>

         <div
            className="grid gap-2 bg-slate-950 p-4 md:p-8 rounded shadow-2xl relative min-w-fit mx-auto"
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                maxWidth: '100%',
                overflow: 'auto',
                touchAction: 'pan-x pan-y'
            }}
         >
            {sortedGrid.map((tile) => {
                const item = getRackAt(tile.x, tile.y);
                return (
                    <div
                        key={`${tile.x}-${tile.y}`}
                        onClick={() => {
                            if (item) {
                                if (item.type === 'rack') setSelectedRackId(item.id);
                            } else {
                                handleCellClick(tile.x, tile.y);
                            }
                        }}
                        className={cn(
                            "w-16 h-16 sm:w-20 sm:h-20 border-2 rounded flex items-center justify-center cursor-pointer transition-all relative",
                            !tile.unlocked
                                ? "bg-slate-950/80 border-slate-800 hover:border-slate-600"
                                : item
                                    ? "bg-slate-800 border-blue-500 hover:bg-slate-700"
                                    : "bg-slate-900 border-slate-700 border-dashed hover:border-slate-500",
                            selectedItemToPlace && tile.unlocked && !item && "hover:bg-green-900/50 hover:border-green-500"
                        )}
                    >
                        {!tile.unlocked && (
                            <div className="flex flex-col items-center text-slate-600">
                                <Lock className="w-6 h-6" />
                                <span className="text-[10px] mt-1">{tile.price / 1000}k</span>
                            </div>
                        )}
                        {item && item.type === 'rack' && (
                            <div className="flex flex-col items-center">
                                <Server className="w-8 h-8 text-blue-400" />
                                <span className="text-[10px] mt-1 text-slate-300 font-mono">
                                    {item.servers.filter(s => s).length}/{item.capacity}
                                </span>
                            </div>
                        )}
                        {item && item.type === 'cooling' && (
                             <div className="flex flex-col items-center">
                                <Snowflake className="w-8 h-8 text-cyan-400" />
                                <span className="text-[10px] mt-1 text-slate-300 font-mono">
                                    {item.power}W
                                </span>
                            </div>
                        )}
                        {item && item.type === 'ups' && (
                             <div className="flex flex-col items-center">
                                <Battery className="w-8 h-8 text-yellow-400" />
                                <span className="text-[10px] mt-1 text-slate-300 font-mono">
                                    UPS
                                </span>
                            </div>
                        )}
                        {item && item.type === 'generator' && (
                             <div className="flex flex-col items-center">
                                <Zap className="w-8 h-8 text-orange-400" />
                                <span className="text-[10px] mt-1 text-slate-300 font-mono">
                                    GEN
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
         </div>

         <div className="absolute bottom-6 left-6 right-6 bg-slate-800 p-4 rounded border border-slate-700 flex gap-4 overflow-x-auto z-10 max-w-full">
             <div className="text-sm font-bold text-slate-400 shrink-0 flex items-center">
                 Inventory:
             </div>
             {inventoryItems.length === 0 && (
                 <div className="text-xs text-slate-500 flex items-center">No items to place. Buy racks or ACs from Market!</div>
             )}
             {inventoryItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => setSelectedItemToPlace(selectedItemToPlace?.id === item.id ? null : item)}
                    className={cn(
                        "px-3 py-2 rounded border text-xs font-bold transition-colors shrink-0 flex items-center gap-2",
                        selectedItemToPlace?.id === item.id
                            ? "bg-blue-600 text-white border-blue-400"
                            : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                    )}
                 >
                     {item.type === 'cooling' ? <Snowflake className="w-3 h-3" /> :
                      item.type === 'ups' ? <Battery className="w-3 h-3" /> :
                      item.type === 'generator' ? <Zap className="w-3 h-3" /> :
                      <Server className="w-3 h-3" />}
                     {item.name}
                 </button>
             ))}
         </div>
      </div>

      {/* Rack Details Modal/Panel */}
      {selectedRackId && (
          <RackDetails
            rackId={selectedRackId}
            onClose={() => setSelectedRackId(null)}
          />
      )}
    </div>
  );
}

function RackDetails({ rackId, onClose }: { rackId: string, onClose: () => void }) {
    const { state, dispatch } = useGame();
    const [installingSlot, setInstallingSlot] = useState<number | null>(null);
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

    const rack = state.racks.find(r => r.id === rackId);

    // We return null here if no rack, which is a conditional return but consistent (hooks run before)
    // Actually hooks run before this if rack exists. If rack doesn't exist, hooks still run?
    // Hooks must run in same order.
    // Ideally, rackId should guarantee rack exists or parent handles it.
    // Parent checks `selectedRackId &&`. So rack likely exists.
    // But `find` returns undefined.
    // If rack is missing, we shouldn't render this component or hooks will mismatch if we return early?
    // No, if we return early, we are fine as long as we don't call hooks *after* return.
    // But I was calling hooks *after* `if (!rack) return null`. That is fine.
    // The issue was `if (selectedServer) return ...` which was inside the component body,
    // and `ServerConsole` might have its own hooks (it does).
    // Wait, `ServerConsole` is a separate component, so its hooks are isolated.
    // But `RackDetails` returns early, so *its own* effects/hooks might be skipped?
    // I am using `useState` at the top now.
    // The problem was `const selectedServerId` state was declared *after* `if (!rack) return null`.
    // And `if (selectedServer) return` means subsequent code in RackDetails is skipped.
    // Does RackDetails have hooks after that return? No.
    // But React creates hooks for the *returned component*? No.

    // Fix: Move all hooks to top.

    if (!rack) return null; // Logic check, technically creates conditional hook execution if rack becomes null later?
    // Ideally parent handles null rack.

    const availableServers = state.inventory.servers;
    const selectedServer = rack.servers.find(s => s && s.id === selectedServerId);

    const handleInstall = (server: ServerType) => {
        if (installingSlot !== null) {
            dispatch({
                type: "PLACE_SERVER",
                serverId: server.id,
                rackId: rack.id,
                slotIndex: installingSlot
            });
            setInstallingSlot(null);
        }
    }

    if (selectedServer) {
        return (
            <ServerConsole
                server={selectedServer}
                onBack={() => setSelectedServerId(null)}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="w-full md:w-96 bg-slate-900 border-l border-slate-800 p-6 flex flex-col h-full overflow-hidden shadow-2xl rounded-r-lg absolute right-0 top-0 bottom-0 z-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold">{rack.name}</h3>
                    <p className="text-xs text-slate-400">Rack ID: {rack.id.substr(0,8)}</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 relative">
                {installingSlot === null && rack.servers.map((server, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "h-14 border rounded flex items-center justify-between px-3 text-sm transition-colors",
                            server
                                ? "bg-slate-800 border-slate-700 cursor-pointer hover:border-blue-500"
                                : "bg-slate-900/50 border-slate-800 border-dashed hover:border-slate-600 cursor-pointer"
                        )}
                        onClick={() => server ? setSelectedServerId(server.id) : setInstallingSlot(idx)}
                    >
                        <span className="text-slate-500 w-6 font-mono text-xs">{idx + 1}</span>
                        {server ? (
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-blue-400 block">{server.name}</span>
                                    <div className="flex gap-2">
                                         {server.installedSoftware.some(s => s.type === 'os') ? (
                                             <span className="text-[10px] text-green-400 flex items-center gap-1"><Terminal className="w-3 h-3"/> Ready</span>
                                         ) : (
                                             <span className="text-[10px] text-red-400 flex items-center gap-1">No OS</span>
                                         )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400">
                                        {server.status === 'active' ? <span className="text-green-500">ON</span> : 'OFF'}
                                    </div>
                                    <div className="text-[10px] text-slate-500">{server.health}% HP</div>
                                </div>
                            </div>
                        ) : (
                            <span className="text-slate-600 flex items-center gap-2"><Plus className="w-3 h-3" /> Install Server</span>
                        )}
                    </div>
                ))}

                {installingSlot !== null && (
                     <div className="absolute inset-0 bg-slate-900 flex flex-col animate-in slide-in-from-right-10">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-slate-300">Select Server for Slot {installingSlot + 1}</h4>
                            <button onClick={() => setInstallingSlot(null)}><X className="w-4 h-4" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {availableServers.length === 0 && (
                                <p className="text-slate-500 text-sm">No servers available. Assemble one first!</p>
                            )}
                            {availableServers.map(server => (
                                <button
                                    key={server.id}
                                    onClick={() => handleInstall(server)}
                                    className="w-full bg-slate-800 p-3 rounded border border-slate-700 hover:border-blue-500 text-left transition-colors"
                                >
                                    <div className="font-bold text-white text-sm">{server.name}</div>
                                    <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                        <span>Pwr: {server.stats.power}W</span>
                                        <span>Perf: {server.stats.compute}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { Software } from "@/lib/types";

function ServerConsole({ server, onBack, onClose }: { server: ServerType, onBack: () => void, onClose: () => void }) {
    const { state, dispatch } = useGame();
    const [tab, setTab] = useState<'info' | 'software'>('info');

    const installedIds = server.installedSoftware.map(s => s.id);
    const availableSoftware = SOFTWARE_CATALOG;

    const install = (sw: Software) => {
        if (state.resources.money >= sw.price) {
            dispatch({ type: 'INSTALL_SOFTWARE', serverId: server.id, software: sw });
        }
    };

    return (
        <div className="w-full md:w-96 bg-slate-950 border-l border-slate-800 p-6 flex flex-col h-full overflow-hidden shadow-2xl rounded-r-lg absolute right-0 top-0 bottom-0 z-30">
             <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="text-slate-400 hover:text-white text-sm underline">Back</button>
                    <h3 className="text-lg font-bold flex items-center gap-2"><Terminal className="w-5 h-5 text-green-500" /> Console</h3>
                </div>
                <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="mb-4">
                <h4 className="text-xl font-bold text-white">{server.name}</h4>
                <div className="flex gap-4 mt-2 text-xs">
                    <button onClick={() => setTab('info')} className={cn("pb-1 border-b-2 transition-colors", tab === 'info' ? "border-blue-500 text-white" : "border-transparent text-slate-500")}>Info</button>
                    <button onClick={() => setTab('software')} className={cn("pb-1 border-b-2 transition-colors", tab === 'software' ? "border-blue-500 text-white" : "border-transparent text-slate-500")}>Software</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {tab === 'info' && (
                    <div className="space-y-4 text-sm text-slate-300">
                        <div className="bg-slate-900 p-3 rounded">
                            <div className="text-xs text-slate-500 uppercase">Specs</div>
                            <div>CPU: {server.components.cpu.name}</div>
                            <div>RAM: {server.components.ram.name}</div>
                            <div>Storage: {server.components.storage.name}</div>
                            <div>Power: {server.stats.power}W</div>
                        </div>
                         <div className="bg-slate-900 p-3 rounded">
                            <div className="text-xs text-slate-500 uppercase">Status</div>
                            <div className="flex justify-between">
                                <span>Health</span>
                                <span className={server.health < 50 ? "text-red-500" : "text-green-500"}>{server.health}%</span>
                            </div>
                             <div className="flex justify-between">
                                <span>OS Status</span>
                                <span className={server.installedSoftware.some(s => s.type === 'os') ? "text-green-500" : "text-red-500"}>
                                    {server.installedSoftware.some(s => s.type === 'os') ? "Operational" : "Missing OS"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'software' && (
                    <div className="space-y-3">
                         {server.installedSoftware.length > 0 && (
                            <div className="mb-4">
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Installed</h5>
                                {server.installedSoftware.map(sw => (
                                    <div key={sw.id} className="bg-slate-800 p-2 rounded flex justify-between items-center text-xs border border-green-900/50">
                                        <span className="text-green-400 font-mono">{sw.name}</span>
                                        {sw.type === 'firewall' && <Shield className="w-3 h-3 text-blue-400" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Available for Install</h5>
                        {availableSoftware.map(sw => {
                             const isInstalled = installedIds.includes(sw.id);
                             const hasOS = server.installedSoftware.some(s => s.type === 'os');
                             // Can only install 1 OS
                             const disabled = isInstalled || (sw.type === 'os' && hasOS);

                             return (
                                <div key={sw.id} className="bg-slate-900 p-3 rounded border border-slate-800 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-sm text-white">{sw.name}</div>
                                        <div className="text-[10px] text-slate-500">{sw.type.toUpperCase()} • {sw.price === 0 ? 'FREE' : `${sw.price/1000}k`}</div>
                                    </div>
                                    <button
                                        onClick={() => install(sw)}
                                        disabled={disabled || state.resources.money < sw.price}
                                        className="px-2 py-1 bg-blue-600 disabled:bg-slate-700 text-xs rounded font-bold"
                                    >
                                        {isInstalled ? "Installed" : "Install"}
                                    </button>
                                </div>
                             );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
