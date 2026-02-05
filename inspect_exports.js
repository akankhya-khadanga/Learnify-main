import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pkgs = [
    '@opentelemetry/sdk-trace-node',
    '@opentelemetry/resources',
    '@opentelemetry/semantic-conventions',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/sdk-trace-base',
    '@opentelemetry/instrumentation',
    '@opentelemetry/instrumentation-http',
    '@opentelemetry/instrumentation-express'
];

pkgs.forEach(p => {
    try {
        const mod = require(p);
        console.log(`\n=== ${p} ===`);
        console.log('Type:', typeof mod);
        if (typeof mod === 'object') {
            console.log('Keys:', Object.keys(mod).join(', '));
            // Check for specific keys we look for
            if (p.includes('resources') && mod.Resource) console.log('✅ Has Resource');
            if (p.includes('resources') && !mod.Resource) console.log('❌ Missing Resource');
        }
    } catch (e) {
        console.log(`Failed ${p}: ${e.message}`);
    }
});
