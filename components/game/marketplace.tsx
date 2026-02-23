"use client";

import { useGame } from "@/lib/game-store";
import { CATALOG } from "@/lib/catalog";
import { ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";

export function Marketplace() {
  const { state, dispatch } = useGame();

  const handleBuy = (item: Component) => {
    if (state.resources.money >= item.price) {
      dispatch({ type: "BUY_COMPONENT", component: item });
    }
  };

  const categories = ["rack", "cooling", "cpu", "ram", "storage", "psu"];

  return (
    <div className="space-y-8 pb-10">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <ShoppingCart className="w-6 h-6" /> Marketplace
      </h2>

      {categories.map((cat) => (
        <div key={cat} className="space-y-4">
          <h3 className="text-xl font-semibold uppercase text-slate-400 border-b border-slate-700 pb-2">
            {cat}s
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CATALOG.filter((i) => i.type === cat).map((item) => (
              <div
                key={item.id}
                className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-slate-100">{item.name}</h4>
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="text-sm text-slate-400 space-y-1 mb-4">
                     {cat === 'psu' ? (
                        <div>Capacity: {item.specs.power}W</div>
                     ) : (
                        item.specs.power > 0 && <div>Power: {item.specs.power}W</div>
                     )}
                     {item.specs.heat > 0 && <div>Heat: {item.specs.heat}</div>}
                     {item.specs.performance > 0 && <div>Perf: {item.specs.performance}</div>}
                     {item.specs.capacity && cat !== 'psu' && <div>Cap: {item.specs.capacity}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                    <div className="text-green-400 font-mono font-bold">
                        {item.price.toLocaleString()}
                    </div>
                    <button
                        onClick={() => handleBuy(item)}
                        disabled={state.resources.money < item.price}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                        Buy
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
