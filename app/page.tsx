import { GameRoot } from "@/components/game/game-root";

export default function Home() {
  return (
    <main className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <GameRoot />
    </main>
  );
}
