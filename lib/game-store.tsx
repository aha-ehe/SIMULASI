"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { GameState, GameAction, Component, Server, Rack, Contract } from "./types";

const GRID_ROWS = 6;
const GRID_COLS = 6;

// Center 2x2 is (2,2), (2,3), (3,2), (3,3)
const initialGrid = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => {
  const x = i % GRID_COLS;
  const y = Math.floor(i / GRID_COLS);
  const isCenter = x >= 2 && x <= 3 && y >= 2 && y <= 3;
  return {
    x,
    y,
    unlocked: isCenter,
    price: isCenter ? 0 : 500000, // 500k to unlock a tile
  };
});

const initialState: GameState = {
  resources: {
    money: 5000000,
    electricity: { current: 0, max: 5000 }, // 5000 Watts limit initially
    heat: { current: 20, max: 80 }, // 20C ambient, 80C danger
    bandwidth: { current: 0, max: 1000 }, // 1Gbps
    reputation: 100,
  },
  grid: initialGrid,
  racks: [],
  inventory: {
    components: [],
    servers: [],
  },
  contracts: [],
  time: 0,
};

function generateRandomContractPerTick(time: number): Contract {
    const computeReq = 20 + Math.floor(Math.random() * 100);
    const duration = 120 + Math.floor(Math.random() * 120);
    const rewardPerTick = Math.ceil(computeReq * 0.5); // E.g. 50 compute -> 25 money/tick

    return {
        id: `cnt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: `Service Contract #${Math.floor(Math.random() * 1000)}`,
        description: `Maintain ${computeReq} compute power.`,
        requirements: { compute: computeReq },
        reward: rewardPerTick,
        duration: duration,
        progress: 0,
        status: 'available',
    };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "TICK": {
      // 1. Calculate Active Load
      let currentPower = 0;
      let currentHeat = 0;
      let totalCompute = 0;
      let totalCooling = 0;

      // Temporary arrays to mutate if needed (e.g. shutdown servers)
      let newRacks = state.racks;

      state.racks.forEach((item) => {
        if (item.type === 'cooling') {
            currentPower += item.power;
            totalCooling += (item.cooling || 0);
        } else if (item.type === 'rack') {
            item.servers.forEach((server) => {
              if (server && server.status === "active") {
                currentPower += server.stats.power;
                currentHeat += server.stats.heat;
                totalCompute += server.stats.compute;
              }
            });
        }
      });

      // 2. Resource Updates
      // Heat dissipation:
      // Ambient is 20. Servers add heat. AC removes heat.
      // Model: Temp = Ambient + (TotalHeat - TotalCooling) / Efficiency
      // If Cooling > Heat, we can go below ambient? No, clamp at ambient for simple AC logic.
      // But usually AC tries to maintain target. Let's make it simple physics:
      // Heat adds to temp, Cooling subtracts.
      // Let's stick to the previous simple model but incorporate cooling.
      // old: newTemp = 20 + currentHeat / 100
      // new: newTemp = 20 + max(0, currentHeat - totalCooling) / 100
      // Wait, 20 is ambient. If cooling capacity is huge, it should just be ambient.
      // If we have 1000 Heat and 500 Cooling, effective heat is 500.

      const effectiveHeat = Math.max(0, currentHeat - totalCooling);
      const coolingFactor = 100; // Thermal mass of the room
      const newTemp = 20 + effectiveHeat / coolingFactor;

      // 3. Power Failure Check
      if (currentPower > state.resources.electricity.max) {
          // Blackout! Turn off all servers
          newRacks = state.racks.map(item => {
              if (item.type === 'rack') {
                  return {
                     ...item,
                     servers: item.servers.map(s => s ? { ...s, status: 'off' } : null)
                  };
              }
              // AC units (cooling) don't have 'status' field currently, but they stop working if power is cut.
              // Logic handles this by currentPower becoming 0 next tick if we don't fix it.
              // For now, let's just accept the blackout clears active load.
              return item;
          });
          currentPower = 0;
          // currentHeat stays, but generation stops.
          // Immediate cooling effect for generation? Yes, no power = no heat gen.
      }

      // 4. Overheat Check
      if (newTemp > state.resources.heat.max) {
           // Danger!
           // For MVP, randomly turn off servers or reduce reputation.
      }

      // 5. Contracts Logic
      // Generate new contracts
      let newContracts = [...state.contracts];
      if (state.time % 5 === 0 && newContracts.filter(c => c.status === 'available').length < 5) {
          newContracts.push(generateRandomContractPerTick(state.time));
      }

      // Update active contracts
      let revenue = 0;
      newContracts = newContracts.map((contract) => {
        if (contract.status === "active") {
          if (contract.progress >= contract.duration) {
              return { ...contract, status: 'completed' };
          }

          if (totalCompute >= contract.requirements.compute) {
            revenue += contract.reward;
            return {
              ...contract,
              progress: contract.progress + 1,
            };
          }
        }
        return contract;
      });

      // Cleanup old available contracts?
      if (state.time % 60 === 0) {
          newContracts = newContracts.filter(c => c.status !== 'available' || Math.random() > 0.1);
      }

      // Electricity Cost
      const expenses = currentPower * 0.1;

      return {
        ...state,
        resources: {
          ...state.resources,
          money: state.resources.money + revenue - expenses,
          electricity: { ...state.resources.electricity, current: currentPower },
          heat: { ...state.resources.heat, current: newTemp },
        },
        racks: newRacks,
        contracts: newContracts,
        time: state.time + 1,
      };
    }
    case "BUY_COMPONENT": {
      if (state.resources.money < action.component.price) return state;
      const uniqueComponent = { ...action.component, id: `${action.component.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
      return {
        ...state,
        resources: {
          ...state.resources,
          money: state.resources.money - action.component.price,
        },
        inventory: {
          ...state.inventory,
          components: [...state.inventory.components, uniqueComponent],
        },
      };
    }
    case "ASSEMBLE_SERVER": {
        const { cpu, ram, storage, psu } = action.components;
        const totalPower = cpu.specs.power + ram.specs.power + storage.specs.power;

        const newServer: Server = {
            id: `srv-${Date.now()}`,
            name: action.name,
            components: { cpu, ram, storage, psu },
            status: "off",
            stats: {
                power: totalPower,
                heat: cpu.specs.heat + ram.specs.heat + storage.specs.heat + psu.specs.heat,
                compute: cpu.specs.performance + ram.specs.performance,
            }
        };

        const usedIds = [cpu.id, ram.id, storage.id, psu.id];
        const newInventoryComponents = state.inventory.components.filter(c => !usedIds.includes(c.id));

        return {
            ...state,
            inventory: {
                ...state.inventory,
                components: newInventoryComponents,
                servers: [...state.inventory.servers, newServer],
            }
        };
    }
    case "PLACE_ITEM": {
        // Check if tile is unlocked
        const tile = state.grid.find(t => t.x === action.position.x && t.y === action.position.y);
        if (!tile || !tile.unlocked) return state;

        const isOccupied = state.racks.some(r => r.position.x === action.position.x && r.position.y === action.position.y);
        if (isOccupied) return state;

        const itemIndex = state.inventory.components.findIndex(c => c.id === action.itemComponent.id);
        if (itemIndex === -1) return state;

        const newComponents = [...state.inventory.components];
        newComponents.splice(itemIndex, 1);

        const isRack = action.itemComponent.type === 'rack';

        const newItem: Rack = { // Using 'Rack' interface for all placed items for now
             id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
             name: action.itemComponent.name,
             type: action.itemComponent.type,
             capacity: isRack ? (action.itemComponent.specs.capacity || 10) : 0,
             cooling: action.itemComponent.type === 'cooling' ? action.itemComponent.specs.performance : 0, // performance = cooling capacity
             power: action.itemComponent.specs.power,
             servers: isRack ? Array(action.itemComponent.specs.capacity || 10).fill(null) : [],
             position: action.position,
         };

         return {
             ...state,
             inventory: { ...state.inventory, components: newComponents },
             racks: [...state.racks, newItem],
         };
    }
    case "UNLOCK_TILE": {
        const tileIndex = state.grid.findIndex(t => t.x === action.x && t.y === action.y);
        if (tileIndex === -1) return state;

        const tile = state.grid[tileIndex];
        if (tile.unlocked) return state;
        if (state.resources.money < tile.price) return state;

        const newGrid = [...state.grid];
        newGrid[tileIndex] = { ...tile, unlocked: true };

        return {
            ...state,
            resources: { ...state.resources, money: state.resources.money - tile.price },
            grid: newGrid,
        };
    }
    case "PLACE_SERVER": {
        const { serverId, rackId, slotIndex } = action;
        const serverIndex = state.inventory.servers.findIndex(s => s.id === serverId);
        if (serverIndex === -1) return state;

        const server = state.inventory.servers[serverIndex];
        const newServersList = [...state.inventory.servers];
        newServersList.splice(serverIndex, 1);

        const newRacks = state.racks.map(rack => {
            if (rack.id === rackId) {
                const newSlots = [...rack.servers];
                if (newSlots[slotIndex] === null) {
                    newSlots[slotIndex] = { ...server, status: "active" }; // Auto turn on
                    return { ...rack, servers: newSlots };
                }
            }
            return rack;
        });

        return {
            ...state,
            inventory: { ...state.inventory, servers: newServersList },
            racks: newRacks,
        };
    }
    case "ACCEPT_CONTRACT": {
        const contractIndex = state.contracts.findIndex(c => c.id === action.contractId);
        if (contractIndex === -1) return state;

        const newContracts = [...state.contracts];
        newContracts[contractIndex] = { ...newContracts[contractIndex], status: 'active' };

        return { ...state, contracts: newContracts };
    }
    case "LOAD_GAME":
      return action.state;
    case "RESET_GAME":
      return initialState;
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load Game
  useEffect(() => {
    const saved = localStorage.getItem("dc-tycoon-save");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate if parsed state has necessary structure to avoid crash
        if (parsed && parsed.resources) {
             dispatch({ type: "LOAD_GAME", state: parsed });
        }
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  // Save Game Loop
  const stateRef = React.useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem("dc-tycoon-save", JSON.stringify(stateRef.current));
    }, 5000);
    return () => clearInterval(saveInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
