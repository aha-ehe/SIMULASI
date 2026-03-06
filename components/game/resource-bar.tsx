"use client";

import { useGame } from "@/lib/game-store";
import { Zap, Flame, DollarSign, Activity, Signal } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResourceBar() {
  const { state } = useGame();
  const { money, electricity, heat, bandwidth, reputation } = state.resources;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900 border-b border-slate-800 p-2 md:p-4 shadow-md sticky top-0 z-20 shrink-0 gap-2 md:gap-0">
      <div className="flex gap-4 md:gap-6 items-center w-full overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
        {/* Money */}
        <div className="flex items-center gap-1 md:gap-2 text-green-400 font-bold text-sm md:text-lg min-w-fit" title="Cash available">
          <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
          <span>{money.toLocaleString()} IDR</span>
        </div>

        {/* Electricity */}
        <div className="flex items-center gap-1 md:gap-2 text-yellow-400 min-w-fit" title="Power Usage / Capacity. Install Generators to increase max capacity.">
          <Zap className="w-4 h-4 md:w-5 md:h-5" />
          <div className="flex flex-col text-[10px] md:text-xs leading-none gap-0.5">
            <span className="font-bold text-sm md:text-base">{electricity.current.toFixed(0)} W</span>
            <span className="text-slate-500">/ {electricity.max} W</span>
          </div>
        </div>

        {/* Heat */}
        <div className={cn("flex items-center gap-1 md:gap-2 min-w-fit", heat.current > 60 ? "text-red-500" : "text-orange-400")} title="Current Temperature. Install AC to reduce heat. High heat damages servers.">
          <Flame className="w-4 h-4 md:w-5 md:h-5" />
          <div className="flex flex-col text-[10px] md:text-xs leading-none gap-0.5">
             <span className="font-bold text-sm md:text-base">{heat.current.toFixed(1)}°C</span>
             <span className="text-slate-500">Max {heat.max}°C</span>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="flex items-center gap-1 md:gap-2 text-blue-400 min-w-fit" title="Bandwidth Usage / Capacity. Buy ISP Plans to increase max capacity.">
          <Signal className="w-4 h-4 md:w-5 md:h-5" />
          <div className="flex flex-col text-[10px] md:text-xs leading-none gap-0.5">
             <span className="font-bold text-sm md:text-base">{bandwidth.current} Gbps</span>
             <span className="text-slate-500">/ {bandwidth.max} Gbps</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-1 md:mt-0">
        {/* Reputation */}
        <div className="flex items-center gap-2 text-purple-400 text-xs md:text-base">
          <Activity className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-bold">{reputation} Rep</span>
        </div>

        <div className="text-[10px] md:text-xs text-slate-500 font-mono w-[80px] text-right">
          {Math.floor(state.time / 60).toString().padStart(2, '0')}:{(state.time % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
