"use client";

import { useGame } from "@/lib/game-store";
import { Bitcoin, RefreshCw, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export function CryptoDashboard() {
  const { state, dispatch } = useGame();

  // Calculate total hashrate
  const totalHashrate = state.racks
    .filter(r => r.type === 'rack')
    .flatMap(r => r.servers)
    .filter(s => s && s.status === 'active' && s.components.gpu)
    .reduce((acc, s) => acc + (s?.components.gpu?.specs.performance || 0), 0);

  const coins = Object.keys(state.crypto.wallet);

  return (
    <div className="space-y-6 pb-20">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bitcoin className="w-6 h-6 text-yellow-500" /> Crypto Mining Center
        </h2>

        {/* Status */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg flex justify-between items-center">
            <div>
                <div className="text-sm text-slate-400">Total Hashrate</div>
                <div className="text-3xl font-bold text-white font-mono">{totalHashrate.toLocaleString()} MH/s</div>
            </div>
            <div className="text-right">
                <div className="text-sm text-slate-400">Active GPUs</div>
                <div className="text-2xl font-bold text-blue-400">
                    {state.racks
                        .filter(r => r.type === 'rack')
                        .flatMap(r => r.servers)
                        .filter(s => s && s.status === 'active' && s.components.gpu).length}
                </div>
            </div>
        </div>

        {/* Wallet & Market */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coins.map(coin => (
                <div key={coin} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                                {coin[0]}
                            </div>
                            <div>
                                <div className="font-bold text-white">{coin}</div>
                                <div className="text-xs text-slate-400">Balance: {state.crypto.wallet[coin].toFixed(6)}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-400 font-bold flex items-center justify-end gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {state.crypto.prices[coin].toLocaleString()} IDR
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-700 pt-4">
                        <div className="text-xs text-slate-500">
                            Value: {Math.floor(state.crypto.wallet[coin] * state.crypto.prices[coin]).toLocaleString()} IDR
                        </div>
                        <button
                            onClick={() => dispatch({ type: 'SELL_CRYPTO', coin, amount: state.crypto.wallet[coin] })}
                            disabled={state.crypto.wallet[coin] <= 0}
                            className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
                        >
                            <DollarSign className="w-3 h-3" /> Sell All
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
