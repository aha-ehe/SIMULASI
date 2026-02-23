"use client";

import { useGame } from "@/lib/game-store";
import { AlertTriangle, ZapOff, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventsPanel() {
  const { state } = useGame();

  if (state.events.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-72">
      {state.events.map(event => (
        <div
            key={event.id}
            className={cn(
                "p-4 rounded border-l-4 shadow-lg animate-in slide-in-from-right",
                event.type === 'ddos' ? "bg-red-900/90 border-red-500 text-red-100" :
                event.type === 'outage' ? "bg-orange-900/90 border-orange-500 text-orange-100" :
                "bg-slate-800 border-slate-500"
            )}
        >
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold flex items-center gap-2">
                    {event.type === 'ddos' && <ShieldAlert className="w-5 h-5" />}
                    {event.type === 'outage' && <ZapOff className="w-5 h-5" />}
                    {event.title}
                </h4>
                <span className="text-xs font-mono opacity-80">{event.startTime + event.duration - state.time}s</span>
            </div>
            <p className="text-xs opacity-90">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
