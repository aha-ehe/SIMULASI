"use client";

import { useGame } from "@/lib/game-store";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Contracts() {
  const { state, dispatch } = useGame();

  const availableContracts = state.contracts.filter(c => c.status === 'available');
  const activeContracts = state.contracts.filter(c => c.status === 'active' || c.status === 'completed');

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="w-6 h-6" /> Contracts
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Contracts */}
        <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-slate-700 pb-2 text-slate-400 uppercase">Available Jobs</h3>
            <div className="space-y-3">
                {availableContracts.length === 0 && <p className="text-slate-500">No contracts available. Wait for new offers.</p>}
                {availableContracts.map(contract => (
                    <div key={contract.id} className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-blue-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{contract.name}</h4>
                            <span className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded font-mono">
                                {contract.reward} IDR/s
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{contract.description}</p>
                        <div className="flex justify-between items-end text-xs text-slate-500 font-mono">
                            <div>
                                <div>REQ: {contract.requirements.compute} Compute</div>
                                <div>DUR: {contract.duration}s</div>
                            </div>
                            <button
                                onClick={() => dispatch({ type: 'ACCEPT_CONTRACT', contractId: contract.id })}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold transition-colors cursor-pointer"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Active Contracts */}
        <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-slate-700 pb-2 text-slate-400 uppercase">Active Contracts</h3>
             <div className="space-y-3">
                {activeContracts.length === 0 && <p className="text-slate-500">No active contracts.</p>}
                {activeContracts.map(contract => (
                    <div key={contract.id} className={cn(
                        "bg-slate-800 p-4 rounded border transition-colors",
                        contract.status === 'completed' ? "border-green-500/50 bg-green-900/10" : "border-slate-700"
                    )}>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{contract.name}</h4>
                            {contract.status === 'completed' ? (
                                <span className="flex items-center gap-1 text-green-500 font-bold text-sm">
                                    <CheckCircle className="w-4 h-4" /> Completed
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-blue-400 font-bold text-sm">
                                    <Clock className="w-4 h-4" /> In Progress
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Progress</span>
                                <span>{contract.progress} / {contract.duration}s</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-1000", contract.status === 'completed' ? "bg-green-500" : "bg-blue-500")}
                                    style={{ width: `${Math.min(100, (contract.progress / contract.duration) * 100)}%` }}
                                />
                            </div>
                             <div className="flex justify-between text-xs mt-1">
                                <span className="text-slate-500">Req: {contract.requirements.compute} Compute</span>
                                <span className="text-green-400 font-mono">Earned: {(contract.progress * contract.reward).toLocaleString()} IDR</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
