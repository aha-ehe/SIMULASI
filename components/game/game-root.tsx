"use client";
import { GameProvider } from "@/lib/game-store";
import { GameLayout } from "./game-layout";

export function GameRoot() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}
