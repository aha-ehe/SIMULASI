import { Component } from "./types";

export const CATALOG: Component[] = [
  // CPUs
  {
    id: "cpu-basic",
    name: "Celeron 2.0GHz",
    type: "cpu",
    price: 500000,
    specs: { power: 30, heat: 10, performance: 10, cores: 2, speed: 2.0 },
  },
  {
    id: "cpu-mid",
    name: "Core i5 3.5GHz",
    type: "cpu",
    price: 2500000,
    specs: { power: 65, heat: 30, performance: 50, cores: 6, speed: 3.5 },
  },
  {
    id: "cpu-high",
    name: "Xeon Silver",
    type: "cpu",
    price: 8000000,
    specs: { power: 120, heat: 60, performance: 120, cores: 16, speed: 3.0 },
  },

  // RAM
  {
    id: "ram-4gb",
    name: "4GB DDR4",
    type: "ram",
    price: 200000,
    specs: { power: 5, heat: 2, performance: 10, capacity: 4 },
  },
  {
    id: "ram-16gb",
    name: "16GB DDR4",
    type: "ram",
    price: 800000,
    specs: { power: 10, heat: 5, performance: 40, capacity: 16 },
  },

  // Storage
  {
    id: "ssd-256",
    name: "256GB SSD",
    type: "storage",
    price: 400000,
    specs: { power: 5, heat: 2, performance: 20, capacity: 256 },
  },
  {
    id: "hdd-1tb",
    name: "1TB HDD",
    type: "storage",
    price: 600000,
    specs: { power: 10, heat: 8, performance: 10, capacity: 1024 },
  },

  // PSUs
  {
    id: "psu-300w",
    name: "300W Generic PSU",
    type: "psu",
    price: 300000,
    specs: { power: 300, heat: 0, performance: 0 }, // Power here means capacity
  },
  {
    id: "psu-600w",
    name: "600W Gold PSU",
    type: "psu",
    price: 900000,
    specs: { power: 600, heat: 0, performance: 0 },
  },

  // Racks
  {
    id: "rack-small",
    name: "10U Open Rack",
    type: "rack",
    price: 1500000,
    specs: { power: 0, heat: 0, performance: 0, capacity: 10 },
  },
   {
    id: "rack-standard",
    name: "42U Standard Rack",
    type: "rack",
    price: 5000000,
    specs: { power: 0, heat: 0, performance: 0, capacity: 42 },
  },

  // Cooling (AC)
  {
    id: "ac-basic",
    name: "Portable AC Unit",
    type: "cooling",
    price: 2000000,
    specs: { power: 500, heat: 0, performance: 2000 }, // Performance = Cooling Capacity (e.g., BTU/h or specific heat unit)
  },
  {
    id: "ac-industrial",
    name: "Industrial Chiller",
    type: "cooling",
    price: 10000000,
    specs: { power: 2000, heat: 0, performance: 10000 },
  },
];
