export type ResourceType = 'money' | 'electricity' | 'heat' | 'bandwidth' | 'reputation';

export interface Resources {
  money: number;
  electricity: {
    current: number; // Wattage used
    max: number;     // Total capacity (from Grid connection)
  };
  heat: {
    current: number; // Current temperature
    max: number;     // Max safe temperature
  };
  bandwidth: {
    current: number; // Used bandwidth
    max: number;     // Total bandwidth capacity
  };
  reputation: number;
}

export type ComponentType = 'cpu' | 'ram' | 'storage' | 'psu' | 'rack' | 'cooling';

export interface ComponentSpecs {
  power: number; // Wattage consumption
  heat: number;  // Heat generation
  performance: number; // Generic score
  capacity?: number; // e.g., GB for RAM/Storage, U for Rack
  cores?: number; // For CPU
  speed?: number; // For CPU/RAM
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  price: number;
  specs: ComponentSpecs;
}

export interface Server {
  id: string;
  name: string;
  components: {
    cpu: Component;
    ram: Component;
    storage: Component;
    psu: Component;
  };
  status: 'active' | 'off' | 'maintenance';
  stats: {
    power: number;
    heat: number;
    compute: number; // Aggregated performance
  };
}

export interface Rack {
  id: string;
  name: string;
  type: ComponentType; // 'rack' or 'cooling'
  capacity?: number; // Number of slots (U) - only for racks
  cooling?: number; // Cooling capacity (BTU or relative unit) - only for cooling
  power: number; // Power consumption (for AC)
  servers: (Server | null)[]; // Slot based, null = empty
  position: { x: number; y: number };
}

export interface Tile {
  x: number;
  y: number;
  unlocked: boolean;
  price: number;
}

export interface Contract {
  id: string;
  name: string;
  description: string;
  requirements: {
    compute: number; // Required performance
  };
  reward: number; // Money per tick
  duration: number; // Total ticks required
  progress: number; // Ticks completed
  status: 'available' | 'active' | 'completed' | 'failed';
}

export interface GameState {
  resources: Resources;
  grid: Tile[]; // Track unlocked tiles
  racks: Rack[]; // Placed items (racks + ACs)
  inventory: {
    components: Component[];
    servers: Server[]; // Assembled servers ready to deploy
  };
  contracts: Contract[];
  time: number; // Game ticks
}

export type GameAction =
  | { type: 'TICK' }
  | { type: 'BUY_COMPONENT'; component: Component }
  | { type: 'ASSEMBLE_SERVER'; name: string; components: { cpu: Component; ram: Component; storage: Component; psu: Component } }
  | { type: 'PLACE_ITEM'; itemComponent: Component; position: { x: number; y: number } }
  | { type: 'UNLOCK_TILE'; x: number; y: number }
  | { type: 'PLACE_SERVER'; serverId: string; rackId: string; slotIndex: number }
  | { type: 'ACCEPT_CONTRACT'; contractId: string }
  | { type: 'LOAD_GAME'; state: GameState }
  | { type: 'RESET_GAME' };
