const BRANDS = ['Nvidio', 'AmyD Radeon', 'Intal Arc'];
const TIERS = [
    { name: 'Entry', multiplier: 1, prefix: 'Gen1' },
    { name: 'Consumer', multiplier: 3, prefix: 'Gen2' },
    { name: 'Pro', multiplier: 8, prefix: 'Gen3' },
    { name: 'Enterprise', multiplier: 20, prefix: 'Gen4' },
    { name: 'Quantum', multiplier: 50, prefix: 'Gen5' },
];

const gpus = [];
for (let i = 0; i < 30; i++) {
    const tierIdx = Math.floor(i / 6);
    const tier = TIERS[tierIdx];
    const brand = BRANDS[i % BRANDS.length];

    const hashrate = 20 * tier.multiplier * (1 + Math.random() * 0.2);
    const power = 100 * tier.multiplier * 0.8;
    const heat = power * 0.9;
    const price = 3000000 * tier.multiplier;

    gpus.push({
        id: `gpu-${i}`,
        name: `${brand} ${tier.prefix} GT-${(i+1)*100}`,
        type: 'gpu',
        price: Math.floor(price / 1000) * 1000,
        specs: { power: Math.floor(power), heat: Math.floor(heat), performance: Math.floor(hashrate) }
    });
}

console.log(JSON.stringify(gpus, null, 2));
