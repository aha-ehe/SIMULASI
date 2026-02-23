"use client";

import { useGame } from "@/lib/game-store";
import { Zap, Flame, DollarSign, Activity, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResourceBar() {
  const { state } = useGame();
  const { money, electricity, heat, bandwidth, reputation } = state.resources;

  return (
    <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 p-4 shadow-md sticky top-0 z-10 h-16 shrink-0">
      <div className="flex gap-6 items-center">
        {/* Money */}
        <div className="flex items-center gap-2 text-green-400 font-bold text-lg min-w-[150px]">
          <DollarSign className="w-5 h-5" />
          <span>{money.toLocaleString()} IDR</span>
        </div>

        {/* Electricity */}
        <div className="flex items-center gap-2 text-yellow-400">
          <Zap className="w-5 h-5" />
          <div className="flex flex-col text-xs leading-none gap-0.5">
            <span className="font-bold text-base">{electricity.current.toFixed(0)} W</span>
            <span className="text-slate-500">/ {electricity.max} W</span>
          </div>
        </div>

        {/* Heat */}
        <div className={cn("flex items-center gap-2", heat.current > 60 ? "text-red-500" : "text-orange-400")}>
          <Flame className="w-5 h-5" />
          <div className="flex flex-col text-xs leading-none gap-0.5">
             <span className="font-bold text-base">{heat.current.toFixed(1)}°C</span>
             <span className="text-slate-500">Max {heat.max}°C</span>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="flex items-center gap-2 text-blue-400">
          <Signal className="w-5 h-5" />
          <div className="flex flex-col text-xs leading-none gap-0.5">
             <span className="font-bold text-base">{bandwidth.current} Gbps</span>
             <span className="text-slate-500">/ {bandwidth.max} Gbps</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Reputation */}
        <div className="flex items-center gap-2 text-purple-400">
          <Activity className="w-5 h-5" />
          <span className="font-bold">{reputation} Rep</span>
        </div>

        <div className="text-xs text-slate-500 font-mono w-[80px] text-right">
          {Math.floor(state.time / 60).toString().padStart(2, '0')}:{(state.time % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
