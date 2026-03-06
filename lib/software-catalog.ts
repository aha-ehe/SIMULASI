import { Software } from "./types";

export const SOFTWARE_CATALOG: Software[] = [
    // Operating Systems
    {
        id: "os-linux-basic",
        name: "Linux (Basic)",
        type: "os",
        price: 0,
        diskSpace: 5,
        ramUsage: 1,
        computeUsage: 5,
    },
    {
        id: "os-linux-ent",
        name: "Enterprise Linux",
        type: "os",
        price: 200000,
        diskSpace: 10,
        ramUsage: 2,
        computeUsage: 10,
    },
    {
        id: "os-windows-srv",
        name: "Windows Server",
        type: "os",
        price: 500000,
        diskSpace: 20,
        ramUsage: 4,
        computeUsage: 15,
    },

    // Firewalls
    {
        id: "fw-basic",
        name: "Basic Firewall",
        type: "firewall",
        price: 100000,
        diskSpace: 1,
        ramUsage: 0.5,
        computeUsage: 2,
        firewallRating: 30,
    },
    {
        id: "fw-advanced",
        name: "Advanced Firewall",
        type: "firewall",
        price: 500000,
        diskSpace: 2,
        ramUsage: 1,
        computeUsage: 5,
        firewallRating: 80,
    },

    // Services (Future use for generating revenue directly)
    {
        id: "svc-web",
        name: "Web Server (Nginx)",
        type: "service",
        price: 0,
        diskSpace: 2,
        ramUsage: 1,
        computeUsage: 10,
    }
];
