"use client";

import { useState } from "react";
import { useGame } from "@/lib/game-store";
import { Server, Cloud, Zap, Globe, Cpu, User, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewGameForm() {
  const { dispatch } = useGame();

  const [name, setName] = useState("My Data Center");
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>("normal");
  const [logo, setLogo] = useState("server");
  const [background, setBackground] = useState<'hacker' | 'heir' | 'engineer'>("engineer");

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      dispatch({ type: "START_GAME", name, difficulty, logo, background });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-500 flex items-center justify-center gap-2">
                <Server className="w-8 h-8" /> Data Center Tycoon
            </h1>
            <p className="text-slate-400 mt-2">Start your empire.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Company Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="E.g. Cyberdyne Systems"
                />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                    {['easy', 'normal', 'hard'].map(diff => (
                        <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficulty(diff as 'easy' | 'normal' | 'hard')}
                            className={cn(
                                "p-3 rounded border capitalize transition-colors",
                                difficulty === diff ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                            )}
                        >
                            <div className="font-bold">{diff}</div>
                            <div className="text-[10px] opacity-70">
                                {diff === 'easy' ? '10M Start' : diff === 'normal' ? '5M Start' : '1M Start'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Founder Background</label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setBackground('hacker')}
                        className={cn("p-3 rounded border flex flex-col items-center gap-1 transition-colors", background === 'hacker' ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-xs font-bold">Hacker</span>
                        <span className="text-[9px] opacity-70">+50 Rep</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setBackground('heir')}
                        className={cn("p-3 rounded border flex flex-col items-center gap-1 transition-colors", background === 'heir' ? "bg-yellow-600 border-yellow-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}
                    >
                        <Briefcase className="w-5 h-5" />
                        <span className="text-xs font-bold">Heir</span>
                        <span className="text-[9px] opacity-70">+2M Cash</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setBackground('engineer')}
                        className={cn("p-3 rounded border flex flex-col items-center gap-1 transition-colors", background === 'engineer' ? "bg-cyan-600 border-cyan-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}
                    >
                        <GraduationCap className="w-5 h-5" />
                        <span className="text-xs font-bold">Engineer</span>
                        <span className="text-[9px] opacity-70">Free AC</span>
                    </button>
                </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Company Logo</label>
                <div className="flex gap-4 justify-center">
                    {[
                        { id: 'server', icon: Server },
                        { id: 'cloud', icon: Cloud },
                        { id: 'zap', icon: Zap },
                        { id: 'globe', icon: Globe },
                        { id: 'cpu', icon: Cpu },
                    ].map(item => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setLogo(item.id)}
                            className={cn(
                                "p-3 rounded-full border transition-all",
                                logo === item.id ? "bg-white text-slate-900 border-white scale-110" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                            )}
                        >
                            <item.icon className="w-6 h-6" />
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg shadow-lg text-lg transition-transform active:scale-95 mt-4"
            >
                Launch Company
            </button>
        </form>
      </div>
    </div>
  );
}
