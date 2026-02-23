"use client";

import { useGame } from "@/lib/game-store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Component, Server as ServerType, Rack } from "@/lib/types";
import { Server, X, Plus, Snowflake, Lock } from "lucide-react";

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

  const inventoryItems = state.inventory.components.filter(c => c.type === 'rack' || c.type === 'cooling');
  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative">
      <div className="flex-1 bg-slate-900 rounded-lg p-6 border border-slate-800 flex flex-col items-center justify-center relative overflow-auto">
         <h2 className="absolute top-6 left-6 text-2xl font-bold flex items-center gap-2 z-10">
            <Server className="w-6 h-6" /> Data Center Floor
         </h2>

         <div
            className="grid gap-2 bg-slate-950 p-8 rounded shadow-2xl relative"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
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
                     {item.type === 'cooling' ? <Snowflake className="w-3 h-3" /> : <Server className="w-3 h-3" />}
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

    const rack = state.racks.find(r => r.id === rackId);
    if (!rack) return null;

    const availableServers = state.inventory.servers;

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

    return (
        <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 flex flex-col h-full overflow-hidden shadow-2xl rounded-r-lg">
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
                            "h-12 border rounded flex items-center justify-between px-3 text-sm transition-colors",
                            server
                                ? "bg-slate-800 border-slate-700"
                                : "bg-slate-900/50 border-slate-800 border-dashed hover:border-slate-600 cursor-pointer"
                        )}
                        onClick={() => !server && setInstallingSlot(idx)}
                    >
                        <span className="text-slate-500 w-6 font-mono text-xs">{idx + 1}</span>
                        {server ? (
                            <div className="flex-1 flex justify-between items-center">
                                <span className="font-bold text-blue-400">{server.name}</span>
                                <div className="text-[10px] text-slate-400">
                                    {server.status === 'active' ? <span className="text-green-500">RUNNING</span> : 'OFF'}
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
