"use client";

import { useGame } from "@/lib/game-store";
import { CATALOG } from "@/lib/catalog";
import { ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Component } from "@/lib/types";
import { useState } from "react";

export function Marketplace() {
  const { state, dispatch } = useGame();

  const handleBuy = (item: Component) => {
    if (state.resources.money >= item.price) {
      dispatch({ type: "BUY_COMPONENT", component: item });
    }
  };

  const categories = ["rack", "cooling", "cpu", "ram", "storage", "psu", "gpu", "ups", "generator", "isp"];
  const [activeTab, setActiveTab] = useState("rack");
  const [search, setSearch] = useState("");

  const filteredCatalog = CATALOG.filter(item =>
      item.type === activeTab && item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
        <ShoppingCart className="w-6 h-6" /> Marketplace
      </h2>

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur pb-2">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-blue-500"
          />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                    activeTab === cat
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                  {cat.toUpperCase()}
              </button>
          ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCatalog.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">No items found.</p>}
        {filteredCatalog.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-base text-slate-100 leading-tight">{item.name}</h4>
                <Package className="w-5 h-5 text-slate-500 shrink-0" />
              </div>
              <div className="text-xs text-slate-400 space-y-1 mb-4 grid grid-cols-2 gap-1">
                 {activeTab === 'psu' ? (
                    <div className="col-span-2">Cap: <span className="text-slate-200">{item.specs.power}W</span></div>
                 ) : (
                    item.specs.power > 0 && <div>Pwr: <span className="text-slate-200">{item.specs.power}W</span></div>
                 )}
                 {item.specs.heat > 0 && <div>Heat: <span className="text-slate-200">{item.specs.heat}</span></div>}
                 {item.specs.performance > 0 && <div>Perf: <span className="text-slate-200">{item.specs.performance}</span></div>}
                 {item.specs.capacity && activeTab !== 'psu' && <div>Cap: <span className="text-slate-200">{item.specs.capacity}</span></div>}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-700/50">
                <div className="text-green-400 font-mono font-bold text-sm">
                    {item.price.toLocaleString()}
                </div>
                <button
                    onClick={() => handleBuy(item)}
                    disabled={state.resources.money < item.price}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    Buy
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
