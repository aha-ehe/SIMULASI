"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { GameState, GameAction, Component, Server, Rack, Contract, Software, Staff, VpsClient } from "./types";

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
    money: 0, // Set by difficulty
    electricity: { current: 0, max: 5000 }, // 5000 Watts limit initially
    heat: { current: 20, max: 80 }, // 20C ambient, 80C danger
    bandwidth: { current: 0, max: 1000 }, // 1Gbps
    reputation: 0,
  },
  grid: initialGrid,
  racks: [],
  inventory: {
    components: [],
    servers: [],
  },
  contracts: [],
  staff: [],
  events: [],
  clients: [],
  time: 0,
  gameStarted: false,
  companyName: "My Data Center",
  difficulty: "normal",
  logo: "server",
  background: "engineer",
};

function generateRandomContractPerTick(time: number): Contract {
    const computeReq = 20 + Math.floor(Math.random() * 100);
    const bandwidthReq = 10 + Math.floor(Math.random() * 50); // New bandwidth requirement
    const duration = 120 + Math.floor(Math.random() * 120);
    const rewardPerTick = Math.ceil(computeReq * 0.5 + bandwidthReq * 0.2);

    return {
        id: `cnt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: `Service Contract #${Math.floor(Math.random() * 1000)}`,
        description: `Maintain ${computeReq} compute power and ${bandwidthReq} Gbps bandwidth.`,
        requirements: { compute: computeReq, bandwidth: bandwidthReq },
        reward: rewardPerTick,
        duration: duration,
        progress: 0,
        status: 'available',
    };
}

function generateRandomEvent(time: number, reputation: number): GameEvent | null {
    // Basic probability, higher reputation = more risk?
    // Start events only after 10 minutes (600 ticks) to protect new players
    if (time < 600) return null;

    const roll = Math.random();
    // 0.2% chance per tick (reduced from 0.5% for better balance)
    if (roll < 0.002) {
        const typeRoll = Math.random();
        if (typeRoll < 0.5) {
            return {
                id: `evt-${Date.now()}`,
                type: 'ddos',
                title: 'DDoS Attack',
                description: 'A massive botnet is attacking our network! Bandwidth is crippled.',
                severity: 'high',
                startTime: time,
                duration: 60, // 60 seconds
                active: true,
            };
        } else {
            return {
                 id: `evt-${Date.now()}`,
                 type: 'outage',
                 title: 'Grid Power Instability',
                 description: 'Main power grid is fluctuating. Expect power drops.',
                 severity: 'medium',
                 startTime: time,
                 duration: 45,
                 active: true,
            };
        }
    }
    return null;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
        let money = 0;
        let reputation = 0;
        const inventoryComponents = [];

        // Difficulty Money
        switch (action.difficulty) {
            case 'easy': money = 10000000; break;
            case 'normal': money = 5000000; break;
            case 'hard': money = 1000000; break;
        }

        // Background Bonuses
        switch (action.background) {
            case 'hacker': reputation += 50; break;
            case 'heir': money += 2000000; break;
            case 'engineer':
                // Free Portable AC
                inventoryComponents.push({
                    id: "ac-basic-starter",
                    name: "Portable AC Unit (Starter)",
                    type: "cooling" as const,
                    price: 2000000,
                    specs: { power: 500, heat: 0, performance: 2000 }
                });
                break;
        }

        return {
            ...state,
            gameStarted: true,
            companyName: action.name,
            difficulty: action.difficulty,
            logo: action.logo,
            background: action.background,
            resources: {
                ...state.resources,
                money,
                reputation
            },
            inventory: {
                ...state.inventory,
                components: [...state.inventory.components, ...inventoryComponents]
            }
        };
    }
    case "TICK": {
      if (!state.gameStarted) return state;
      // 1. Calculate Active Load
      let currentPower = 0;
      let currentHeat = 0;
      let totalCompute = 0;
      let totalCooling = 0;

      // Temporary arrays to mutate if needed (e.g. shutdown servers)
      let newRacks = state.racks;

      // 0. Staff Logic (Technicians)
      const technicians = state.staff.filter(s => s.role === 'technician');
      // Each tech repairs 2% health per tick across the board (simplified)
      let repairPoints = technicians.reduce((acc, t) => acc + (t.skill / 10), 0); // e.g. skill 50 -> 5 points

      let racksWithHealth = [...state.racks]; // Copy for mutation during loop

      racksWithHealth = racksWithHealth.map(item => {
        if (item.type === 'rack') {
             const newServers = item.servers.map(server => {
                 if (!server) return null;

                 let newHealth = server.health;

                 // Degradation
                 // Base degradation 0.05% per tick
                 // Heat multiplier: if temp > 40, faster.
                 const heatMultiplier = state.resources.heat.current > 40 ? (state.resources.heat.current - 20) / 20 : 1;
                 const degradation = 0.05 * heatMultiplier;

                 if (server.status === 'active') {
                     newHealth = Math.max(0, newHealth - degradation);
                 }

                 // Repair Logic
                 if (newHealth < 100 && repairPoints > 0) {
                     const repairAmount = Math.min(100 - newHealth, repairPoints); // Repair up to 100 or available points
                     // Prioritize servers < 50%? For now just sequential.
                     newHealth += repairAmount;
                     repairPoints -= repairAmount;
                 }

                 return { ...server, health: newHealth };
             });
             return { ...item, servers: newServers };
        }
        return item;
      });

      newRacks = racksWithHealth;

      // Event Generation
      const newEvents = [...state.events];
      const randomEvent = generateRandomEvent(state.time, state.resources.reputation);
      if (randomEvent) {
          newEvents.push(randomEvent);
      }

      // Filter expired events
      const activeEvents = newEvents.filter(e => {
          if (state.time > e.startTime + e.duration) return false; // expired
          return true;
      });

      const isDdosActive = activeEvents.some(e => e.type === 'ddos');
      const isOutageActive = activeEvents.some(e => e.type === 'outage');

      // Calculate active items and generation
      let generatorCapacity = 0;
      let upsCapacity = 0; // Stored power (Wh) - Not implemented as battery yet, simplified as backup capacity?
      let totalFirewallRating = 0;

      // Let's iterate grid items first
      newRacks.forEach((item) => {
        if (item.type === 'cooling') {
            currentPower += item.power;
            totalCooling += (item.cooling || 0);
        } else if (item.type === 'rack') {
            item.servers.forEach((server) => {
              if (server && server.status === "active") {
                const hasOS = server.installedSoftware.some(s => s.type === 'os');
                currentPower += server.stats.power;
                currentHeat += server.stats.heat;

                // Firewall logic
                server.installedSoftware.forEach(sw => {
                    if (sw.type === 'firewall') {
                        totalFirewallRating += (sw.firewallRating || 0);
                    }
                });

                if (hasOS && server.health > 0) {
                    totalCompute += server.stats.compute;
                }
              }
            });
        } else if (item.type === 'generator') {
             // Generators add to max capacity but cost fuel?
             // For MVP: Generators simply add to max capacity and generate heat.
             // item.specs.performance is capacity.
             generatorCapacity += (item.specs?.performance || 0); // using performance field for capacity
             currentHeat += (item.specs?.heat || 50);
        } else if (item.type === 'ups') {
             // UPS adds 'buffer'
             upsCapacity += (item.specs?.performance || 0);
        }
      });

      // 2. Resource Updates
      // Heat dissipation
      const effectiveHeat = Math.max(0, currentHeat - totalCooling);
      const coolingFactor = 100; // Thermal mass of the room
      const newTemp = 20 + effectiveHeat / coolingFactor;

      // 3. Power Failure Check
      let totalMaxPower = state.resources.electricity.max + generatorCapacity;

      // Simulating Outage Event: Grid power (base 5000) drops to 0?
      if (isOutageActive) {
          totalMaxPower = generatorCapacity; // Only generators work!
      }

      // If load > max, check UPS
      if (currentPower > totalMaxPower) {
          // If we have UPS, maybe we survive if the overload is small?
          // Or UPS gives us time.
          // Simplified: UPS increases tolerance for spikes.
          if (currentPower > totalMaxPower + upsCapacity) {
              // Blackout!
              newRacks = state.racks.map(item => {
                  if (item.type === 'rack') {
                      return {
                         ...item,
                         servers: item.servers.map(s => s ? { ...s, status: 'off' } : null)
                      };
                  }
                  return item;
              });
              currentPower = 0;
          }
      }

      // 4. Overheat Check (simplified)
      // ...

      // 5. Contracts Logic

      // DDoS Logic: Reduces effective compute for contracts
      // If Firewall rating is high, effect is low.
      // 100 rating = 100% protection?
      let effectiveCompute = totalCompute;
      if (isDdosActive) {
          const mitigation = Math.min(1, totalFirewallRating / 100); // Need 100 rating to fully mitigate
          const impact = 0.8 * (1 - mitigation); // Max 80% reduction
          effectiveCompute = totalCompute * (1 - impact);
      }

      // Generate new contracts
      let newContracts = [...state.contracts];
      if (state.time % 5 === 0 && newContracts.filter(c => c.status === 'available').length < 5) {
          newContracts.push(generateRandomContractPerTick(state.time));
      }

      // Update active contracts
      let revenue = 0;
      let usedBandwidth = 0;

      newContracts = newContracts.map((contract) => {
        if (contract.status === "active") {
          if (contract.progress >= contract.duration) {
              return { ...contract, status: 'completed' };
          }

          const bandwidthOk = !contract.requirements.bandwidth || (state.resources.bandwidth.max - usedBandwidth >= contract.requirements.bandwidth);

          if (effectiveCompute >= contract.requirements.compute && bandwidthOk) {
            revenue += contract.reward;
            if (contract.requirements.bandwidth) usedBandwidth += contract.requirements.bandwidth;

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
      let expenses = currentPower * 0.1;

      // Staff Salaries
      const salaries = state.staff.reduce((acc, s) => acc + s.salary, 0);
      expenses += salaries;

      // VPS Revenue
      const vpsRevenue = state.clients.reduce((acc, c) => acc + c.revenue, 0);
      revenue += vpsRevenue;

      return {
        ...state,
        resources: {
          ...state.resources,
          money: state.resources.money + revenue - expenses,
          electricity: { ...state.resources.electricity, current: currentPower },
          heat: { ...state.resources.heat, current: newTemp },
          bandwidth: { ...state.resources.bandwidth, current: usedBandwidth },
        },
        racks: newRacks,
        contracts: newContracts,
        events: activeEvents,
        time: state.time + 1,
      };
    }
    case "BUY_COMPONENT": {
      if (state.resources.money < action.component.price) return state;
      // Special check for ISP upgrade
      if (action.component.type === 'isp') {
          return {
              ...state,
              resources: {
                  ...state.resources,
                  money: state.resources.money - action.component.price,
                  bandwidth: {
                      ...state.resources.bandwidth,
                      max: state.resources.bandwidth.max + action.component.specs.performance
                  }
              }
          };
      }

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
    case "HIRE_STAFF": {
        const hireCost = 100000; // Sign-on bonus/fee
        if (state.resources.money < hireCost) return state;

        const newStaff: Staff = {
            id: `staff-${Date.now()}`,
            name: `${action.role === 'technician' ? 'Tech' : 'Mgr'} ${Math.floor(Math.random() * 100)}`,
            role: action.role,
            salary: action.role === 'technician' ? 500 : 1000, // Salary per tick
            skill: 50 + Math.floor(Math.random() * 50),
            assignedAt: state.time,
        };

        return {
            ...state,
            resources: { ...state.resources, money: state.resources.money - hireCost },
            staff: [...state.staff, newStaff]
        };
    }
    case "FIRE_STAFF": {
        return {
            ...state,
            staff: state.staff.filter(s => s.id !== action.staffId)
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
            },
            installedSoftware: [],
            health: 100,
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
             specs: action.itemComponent.specs,
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
                    newSlots[slotIndex] = { ...server, status: "active" };
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
    case "INSTALL_SOFTWARE": {
        if (state.resources.money < action.software.price) return state;

        const newRacks = state.racks.map(rack => {
            if (rack.type !== 'rack') return rack;
            const newServers = rack.servers.map(server => {
                if (server && server.id === action.serverId) {
                    if (server.installedSoftware.some(s => s.id === action.software.id)) return server;
                    return {
                        ...server,
                        installedSoftware: [...server.installedSoftware, action.software]
                    };
                }
                return server;
            });
            return { ...rack, servers: newServers };
        });

        return {
            ...state,
            resources: { ...state.resources, money: state.resources.money - action.software.price },
            racks: newRacks
        };
    }
    case "UNINSTALL_SOFTWARE": {
        const newRacks = state.racks.map(rack => {
            if (rack.type !== 'rack') return rack;
            const newServers = rack.servers.map(server => {
                if (server && server.id === action.serverId) {
                    return {
                        ...server,
                        installedSoftware: server.installedSoftware.filter(s => s.id !== action.softwareId)
                    };
                }
                return server;
            });
            return { ...rack, servers: newServers };
        });
        return { ...state, racks: newRacks };
    }
    case "PROVISION_VPS": {
        const tiers = {
            'basic': { cpu: 1, ram: 1, storage: 10, revenue: 10, name: "Basic VPS Client" },
            'business': { cpu: 4, ram: 4, storage: 50, revenue: 50, name: "Business VPS Client" },
            'enterprise': { cpu: 8, ram: 16, storage: 200, revenue: 200, name: "Enterprise VPS Client" }
        };
        const tierSpec = tiers[action.tier];

        // Find server
        let serverFound = false;
        // Logic to verify capacity would be complex: we need to sum up usage of all clients on this server.
        // For MVP, we'll just check if server exists and has OS.
        // Ideally we should track 'available resources' on server.
        // Let's assume infinite capacity per server for MVP or very loose check?
        // No, let's implement basic check.

        const currentUsage = state.clients.filter(c => c.serverId === action.serverId).reduce((acc, c) => ({
            cpu: acc.cpu + c.resourceUsage.cpu,
            ram: acc.ram + c.resourceUsage.ram,
            storage: acc.storage + c.resourceUsage.storage
        }), { cpu: 0, ram: 0, storage: 0 });

        let serverCapacity = { cpu: 0, ram: 0, storage: 0 };

        state.racks.forEach(r => {
            if (r.type === 'rack') {
                const s = r.servers.find(srv => srv && srv.id === action.serverId);
                if (s) {
                    serverCapacity = {
                        cpu: s.stats.compute, // Approximation: compute points ~= cpu capacity? No, compute is perf score.
                        // Real specs are in components.
                        // Let's use components:
                        // RAM capacity is in GB.
                        // Storage capacity is in GB.
                        // CPU cores?
                        cpu: s.components.cpu.specs.cores || 0,
                        ram: s.components.ram.specs.capacity || 0,
                        storage: s.components.storage.specs.capacity || 0
                    };
                    serverFound = true;
                }
            }
        });

        if (!serverFound) return state;

        if (currentUsage.cpu + tierSpec.cpu > serverCapacity.cpu ||
            currentUsage.ram + tierSpec.ram > serverCapacity.ram ||
            currentUsage.storage + tierSpec.storage > serverCapacity.storage) {
                // Not enough resources
                // In a real app we'd dispatch an error or handle UI validation.
                return state;
        }

        const newClient: VpsClient = {
            id: `cli-${Date.now()}`,
            name: `${tierSpec.name} #${state.clients.length + 1}`,
            tier: action.tier,
            revenue: tierSpec.revenue,
            serverId: action.serverId,
            resourceUsage: { cpu: tierSpec.cpu, ram: tierSpec.ram, storage: tierSpec.storage },
            joinedAt: state.time
        };

        return {
            ...state,
            clients: [...state.clients, newClient]
        };
    }
    case "TERMINATE_VPS": {
        return {
            ...state,
            clients: state.clients.filter(c => c.id !== action.clientId)
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
